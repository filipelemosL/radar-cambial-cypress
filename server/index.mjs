import cors from 'cors'
import express from 'express'

const app = express()
const port = Number(process.env.PORT || 3001)
const validToken = 'radar-cambial-demo-token'

app.use(cors())
app.use(express.json())

const users = [{
  id: 'analista-01',
  name: 'Analista Cypress',
  email: 'analista@radarcambial.dev',
  password: 'cypress123',
}]

const fallbackRates = {
  USD: { BRL: 5.08, EUR: 0.88, GBP: 0.75, JPY: 163.07 },
  BRL: { USD: 0.197, EUR: 0.173, GBP: 0.147, JPY: 32.1 },
  EUR: { BRL: 5.8, USD: 1.14, GBP: 0.854, JPY: 186.0 },
}

let watchlist = []
let nextWatchlistId = 1

function requireAuth(req, res, next) {
  if (req.headers.authorization !== `Bearer ${validToken}`) {
    return res.status(401).json({ message: 'Sessão inválida ou expirada.' })
  }
  next()
}

function isCurrency(value) {
  return typeof value === 'string' && /^[A-Z]{3}$/.test(value)
}

async function fromFrankfurter(path) {
  const response = await fetch(`https://api.frankfurter.dev/v1${path}`, {
    signal: AbortSignal.timeout(8_000),
  })

  if (!response.ok) throw new Error(`Frankfurter respondeu ${response.status}`)
  return response.json()
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  const user = users.find((candidate) => candidate.email === email && candidate.password === password)

  if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' })

  return res.json({
    token: validToken,
    user: { id: user.id, name: user.name, email: user.email },
  })
})

app.get('/api/auth/me', requireAuth, (_req, res) => {
  const { id, name, email } = users[0]
  res.json({ id, name, email })
})

app.get('/api/market/quotes', requireAuth, async (req, res) => {
  const base = String(req.query.base || 'USD').toUpperCase()
  const rawSymbols = String(req.query.symbols || 'BRL,EUR,GBP,JPY').toUpperCase()
  const symbols = [...new Set(rawSymbols.split(',').filter(isCurrency).filter((symbol) => symbol !== base))]

  if (!isCurrency(base) || symbols.length === 0) {
    return res.status(400).json({ message: 'Informe uma moeda base e ao menos uma moeda de comparação.' })
  }

  try {
    const data = await fromFrankfurter(`/latest?base=${base}&symbols=${symbols.join(',')}`)
    return res.json({
      base,
      date: data.date,
      source: 'Frankfurter API',
      quotes: symbols.filter((symbol) => data.rates[symbol]).map((symbol) => ({
        pair: `${base}/${symbol}`,
        symbol,
        rate: data.rates[symbol],
        change: null,
      })),
    })
  } catch (error) {
    const rates = fallbackRates[base] || fallbackRates.USD
    return res.json({
      base,
      date: new Date().toISOString().slice(0, 10),
      source: 'Dados de contingência (Frankfurter indisponível)',
      fallback: true,
      quotes: symbols.map((symbol) => ({
        pair: `${base}/${symbol}`,
        symbol,
        rate: rates[symbol] ?? 1,
        change: null,
      })),
    })
  }
})

app.get('/api/market/history', requireAuth, async (req, res) => {
  const base = String(req.query.base || 'USD').toUpperCase()
  const symbol = String(req.query.symbol || 'BRL').toUpperCase()
  if (!isCurrency(base) || !isCurrency(symbol)) {
    return res.status(400).json({ message: 'Par de moedas inválido.' })
  }

  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - 14)
  const formatDate = (date) => date.toISOString().slice(0, 10)

  try {
    const data = await fromFrankfurter(`/${formatDate(start)}..${formatDate(end)}?base=${base}&symbols=${symbol}`)
    const points = Object.entries(data.rates).map(([date, rates]) => ({ date, rate: rates[symbol] }))
    res.json({ pair: `${base}/${symbol}`, points, source: 'Frankfurter API' })
  } catch (_error) {
    const current = (fallbackRates[base] || fallbackRates.USD)[symbol] || 1
    const points = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(end)
      date.setDate(end.getDate() - (6 - index))
      return { date: formatDate(date), rate: Number((current * (0.99 + index * 0.003)).toFixed(4)) }
    })
    res.json({ pair: `${base}/${symbol}`, points, source: 'Dados de contingência' })
  }
})

app.get('/api/watchlist', requireAuth, (_req, res) => res.json(watchlist))

app.post('/api/watchlist', requireAuth, (req, res) => {
  const { pair, rate } = req.body ?? {}
  if (typeof pair !== 'string' || typeof rate !== 'number') {
    return res.status(400).json({ message: 'Par e cotação são obrigatórios.' })
  }

  if (watchlist.some((item) => item.pair === pair)) {
    return res.status(409).json({ message: 'Esse par já está na sua análise.' })
  }

  const item = { id: nextWatchlistId++, pair, rate, createdAt: new Date().toISOString() }
  watchlist.push(item)
  res.status(201).json(item)
})

app.delete('/api/watchlist/:id', requireAuth, (req, res) => {
  const initialLength = watchlist.length
  watchlist = watchlist.filter((item) => item.id !== Number(req.params.id))
  if (watchlist.length === initialLength) return res.status(404).json({ message: 'Item não encontrado.' })
  return res.status(204).send()
})

// Endpoint disponível apenas neste laboratório local: facilita cenários independentes no Cypress.
app.post('/api/test/reset', (_req, res) => {
  watchlist = []
  nextWatchlistId = 1
  res.status(204).send()
})

app.listen(port, '127.0.0.1', () => {
  console.log(`API do Radar Cambial disponível em http://127.0.0.1:${port}`)
})
