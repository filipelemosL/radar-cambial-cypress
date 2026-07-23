export type User = {
  id: string
  name: string
  email: string
}

export type Quote = {
  pair: string
  symbol: string
  rate: number
  change: number | null
}

export type QuoteResponse = {
  base: string
  date: string
  source: string
  fallback?: boolean
  quotes: Quote[]
}

export type WatchlistItem = {
  id: number
  pair: string
  rate: number
  createdAt: string
}
