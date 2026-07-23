import { useEffect, useState } from 'react'
import { request } from '../api'

type Point = { date: string; rate: number }
type Props = { base: string; symbol: string; onClose: () => void }

export default function QuoteHistory({ base, symbol, onClose }: Props) {
  const [points, setPoints] = useState<Point[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    request<{ points: Point[] }>(`/api/market/history?base=${base}&symbol=${symbol}`)
      .then((data) => setPoints(data.points))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Erro ao obter histórico.'))
  }, [base, symbol])

  const max = Math.max(...points.map((point) => point.rate), 1)

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="history-modal" data-cy="history-modal" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <button className="icon-button" data-cy="close-history" type="button" onClick={onClose} aria-label="Fechar histórico">×</button>
        <span className="eyebrow">ÚLTIMOS 14 DIAS</span>
        <h2 id="history-title">Histórico {base}/{symbol}</h2>
        {error && <p className="alert error" data-cy="history-error">{error}</p>}
        {!error && points.length === 0 && <p data-cy="history-loading" className="muted">Carregando série histórica…</p>}
        {points.length > 0 && (
          <ol className="history-bars" data-cy="history-points">
            {points.map((point) => (
              <li key={point.date} title={`${point.date}: ${point.rate}`}>
                <span style={{ height: `${Math.max(10, (point.rate / max) * 100)}%` }} />
                <small>{point.date.slice(5)}</small>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
