import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken, request } from '../api'
import QuoteHistory from '../components/QuoteHistory'
import RefreshCountdown from '../components/RefreshCountdown'
import type { Quote, QuoteResponse, WatchlistItem } from '../types'

const currencies = [
  { code: 'BRL', label: 'Real brasileiro' },
  { code: 'USD', label: 'Dólar americano' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'Libra esterlina' },
  { code: 'JPY', label: 'Iene japonês' },
]

function formatRate(rate: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'JPY' ? 2 : 4,
    maximumFractionDigits: currency === 'JPY' ? 2 : 4,
  }).format(rate)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [base, setBase] = useState('USD')
  const [selectedSymbols, setSelectedSymbols] = useState(['BRL', 'EUR', 'GBP', 'JPY'])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [source, setSource] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'symbol' | 'rate-desc' | 'rate-asc'>('symbol')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [historySymbol, setHistorySymbol] = useState<string | null>(null)

  const logout = useCallback(() => {
    clearToken()
    navigate('/login')
  }, [navigate])

  const loadWatchlist = useCallback(async () => {
    try {
      const items = await request<WatchlistItem[]>('/api/watchlist')
      setWatchlist(items)
    } catch (reason) {
      if (reason instanceof Error && reason.message.includes('Sessão inválida')) logout()
    }
  }, [logout])

  const loadQuotes = useCallback(async () => {
    if (selectedSymbols.length === 0) {
      setError('Escolha ao menos uma moeda para comparar.')
      setQuotes([])
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await request<QuoteResponse>(`/api/market/quotes?base=${base}&symbols=${selectedSymbols.join(',')}`)
      setQuotes(data.quotes)
      setSource(data.source)
      setUpdatedAt(data.date)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Não foi possível carregar o mercado.'
      if (message.includes('Sessão inválida')) return logout()
      setError(message)
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }, [base, logout, selectedSymbols])

  useEffect(() => {
    void loadQuotes()
  }, [loadQuotes])

  useEffect(() => {
    void loadWatchlist()
  }, [loadWatchlist])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3_500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const displayedQuotes = useMemo(() => {
    const normalizedQuery = query.trim().toUpperCase()
    const result = normalizedQuery ? quotes.filter((quote) => quote.pair.includes(normalizedQuery)) : quotes
    return [...result].sort((left, right) => {
      if (sort === 'rate-desc') return right.rate - left.rate
      if (sort === 'rate-asc') return left.rate - right.rate
      return left.symbol.localeCompare(right.symbol)
    })
  }, [query, quotes, sort])

  const averageRate = displayedQuotes.length
    ? displayedQuotes.reduce((total, quote) => total + quote.rate, 0) / displayedQuotes.length
    : 0

  function toggleSymbol(symbol: string) {
    setSelectedSymbols((current) => current.includes(symbol)
      ? current.filter((item) => item !== symbol)
      : [...current, symbol])
  }

  function changeBase(nextBase: string) {
    setSelectedSymbols((current) => {
      const compatible = current.filter((symbol) => symbol !== nextBase)
      return [...new Set([...compatible, base])]
    })
    setBase(nextBase)
  }

  async function addToWatchlist(quote: Quote) {
    setToast('')
    try {
      const item = await request<WatchlistItem>('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify({ pair: quote.pair, rate: quote.rate }),
      })
      setWatchlist((current) => [...current, item])
      setToast(`${quote.pair} foi adicionado à sua análise.`)
    } catch (reason) {
      setToast(reason instanceof Error ? reason.message : 'Não foi possível salvar o par.')
    }
  }

  async function removeFromWatchlist(id: number) {
    try {
      await request<void>(`/api/watchlist/${id}`, { method: 'DELETE' })
      setWatchlist((current) => current.filter((item) => item.id !== id))
      setToast('Item removido da análise.')
    } catch (reason) {
      setToast(reason instanceof Error ? reason.message : 'Não foi possível remover o item.')
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="logo" href="/dashboard" aria-label="Radar Cambial, início"><span>R$</span> Radar Cambial</a>
        <nav aria-label="Navegação principal">
          <a href="#cotacoes">Cotações</a>
          <a href="#minha-analise">Minha análise <b data-cy="watchlist-count">{watchlist.length}</b></a>
        </nav>
        <button className="button ghost" data-cy="logout" type="button" onClick={logout}>Sair</button>
      </header>

      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">MERCADO DE MOEDAS</span>
          <h1>Veja o câmbio, encontre movimento.</h1>
          <p>Compare pares em tempo real usando dados abertos da Frankfurter API.</p>
        </div>
        <div className="data-status">
          <i className="status-dot" /> Dados públicos, sem chave
          {updatedAt && <small data-cy="market-date">Referência: {updatedAt}</small>}
        </div>
      </section>

      <section className="filters-card" aria-label="Filtros de mercado">
        <div className="filter-field">
          <label htmlFor="market-base">Moeda base</label>
          <select id="market-base" data-cy="market-base" value={base} onChange={(event) => changeBase(event.target.value)}>
            {currencies.map((currency) => <option value={currency.code} key={currency.code}>{currency.code} — {currency.label}</option>)}
          </select>
        </div>

        <fieldset className="currency-options">
          <legend>Comparar com</legend>
          {currencies.filter((currency) => currency.code !== base).map((currency) => (
            <label key={currency.code} className="checkbox-label">
              <input
                data-cy={`currency-${currency.code}`}
                type="checkbox"
                checked={selectedSymbols.includes(currency.code)}
                onChange={() => toggleSymbol(currency.code)}
              />
              <span>{currency.code}</span>
            </label>
          ))}
        </fieldset>

        <button className="button primary" data-cy="apply-filters" type="button" onClick={() => void loadQuotes()} disabled={loading}>
          {loading ? 'Atualizando…' : 'Atualizar mercado'}
        </button>
      </section>

      <section id="cotacoes" className="analysis-section" aria-labelledby="quotes-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PAINEL DE ANÁLISE</span>
            <h2 id="quotes-title">Cotações acompanhadas</h2>
          </div>
          <RefreshCountdown onRefresh={() => void loadQuotes()} />
        </div>

        <div className="summary-grid">
          <article className="summary-card" data-cy="summary-count">
            <span>Pares encontrados</span>
            <strong>{displayedQuotes.length}</strong>
          </article>
          <article className="summary-card" data-cy="average-rate">
            <span>Média das cotações</span>
            <strong>{formatRate(averageRate, base)}</strong>
          </article>
          <article className="summary-card source-card">
            <span>Fonte</span>
            <strong data-cy="data-source">{source || 'Carregando…'}</strong>
          </article>
        </div>

        <div className="table-tools">
          <label className="search-input" htmlFor="quote-search">
            <span aria-hidden="true">⌕</span>
            <input id="quote-search" data-cy="quote-search" placeholder="Filtrar por par, ex.: BRL" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="sort-select" htmlFor="sort-quotes">
            Ordenar
            <select id="sort-quotes" data-cy="sort-quotes" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
              <option value="symbol">Par (A–Z)</option>
              <option value="rate-desc">Maior cotação</option>
              <option value="rate-asc">Menor cotação</option>
            </select>
          </label>
        </div>

        {loading && <div className="loading-panel" data-cy="market-spinner" role="status">Consultando o mercado…</div>}
        {error && <p className="alert error" data-cy="market-error" role="alert">{error}</p>}
        {!loading && !error && displayedQuotes.length === 0 && <p className="empty-state" data-cy="empty-quotes">Nenhum par corresponde ao filtro atual.</p>}

        {!loading && !error && displayedQuotes.length > 0 && (
          <div className="quotes-table" role="table" aria-label="Tabela de cotações">
            <div className="quote-header" role="row"><span>Par</span><span>1 {base} vale</span><span>Ações</span></div>
            {displayedQuotes.map((quote) => {
              const watched = watchlist.some((item) => item.pair === quote.pair)
              return (
                <article className="quote-row" data-cy="quote-row" data-pair={quote.pair} role="row" key={quote.pair}>
                  <div><strong>{quote.pair}</strong><small>Mercado à vista</small></div>
                  <div><strong data-cy="quote-rate">{formatRate(quote.rate, quote.symbol)}</strong><small>fechamento mais recente</small></div>
                  <div className="row-actions">
                    <button data-cy="view-history" className="text-button" type="button" onClick={() => setHistorySymbol(quote.symbol)}>Histórico</button>
                    <button
                      data-cy="add-watchlist"
                      className="button small"
                      type="button"
                      disabled={watched}
                      onClick={() => void addToWatchlist(quote)}
                    >
                      {watched ? 'Na análise' : 'Analisar'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section id="minha-analise" className="watchlist-section" aria-labelledby="watchlist-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LISTA PESSOAL</span>
            <h2 id="watchlist-title">Minha análise</h2>
          </div>
          <span className="badge" data-cy="watchlist-total">{watchlist.length} {watchlist.length === 1 ? 'par' : 'pares'}</span>
        </div>
        {watchlist.length === 0 ? (
          <div className="watchlist-empty" data-cy="watchlist-empty">Ainda não há pares salvos. Escolha uma cotação acima para começar.</div>
        ) : (
          <ul className="watchlist" data-cy="watchlist">
            {watchlist.map((item) => (
              <li key={item.id} data-cy="watchlist-item">
                <span><strong>{item.pair}</strong><small>{item.rate.toLocaleString('pt-BR')}</small></span>
                <button data-cy="watchlist-remove" className="text-button danger" type="button" onClick={() => void removeFromWatchlist(item.id)}>Remover</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && <div className="toast" data-cy="toast" role="status">{toast}</div>}
      {historySymbol && <QuoteHistory base={base} symbol={historySymbol} onClose={() => setHistorySymbol(null)} />}
    </main>
  )
}
