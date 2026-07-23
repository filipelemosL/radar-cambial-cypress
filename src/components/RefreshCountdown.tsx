import { useEffect, useState } from 'react'

type Props = {
  seconds?: number
  onRefresh: () => void
}

export default function RefreshCountdown({ seconds = 60, onRefresh }: Props) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          onRefresh()
          return seconds
        }
        return current - 1
      })
    }, 1_000)
    return () => window.clearInterval(interval)
  }, [onRefresh, seconds])

  return (
    <span className="countdown" data-cy="refresh-countdown" aria-live="polite">
      Atualização automática em <strong>{remaining}s</strong>
    </span>
  )
}
