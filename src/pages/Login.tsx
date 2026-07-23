import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { request, saveToken } from '../api'
import type { User } from '../types'

type LoginResponse = { token: string; user: User }

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      saveToken(data.token)
      navigate('/dashboard')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="Sobre o laboratório">
        <span className="eyebrow">LABORATÓRIO CYPRESS</span>
        <h1>Radar Cambial</h1>
        <p>Uma bancada segura para praticar testes E2E em um produto de análise de mercado.</p>
        <div className="practice-list">
          <span>Seletores estáveis</span>
          <span>Estados de loading e erro</span>
          <span>API pública sem token</span>
        </div>
      </section>

      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">R$</div>
        <span className="eyebrow">ACESSO DE DEMONSTRAÇÃO</span>
        <h2 id="login-title">Entre para analisar</h2>
        <p className="muted">Use as credenciais de laboratório para começar.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            data-cy="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="analista@radarcambial.dev"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            data-cy="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p className="alert error" data-cy="error" role="alert">{error}</p>}

          <button data-cy="submit-login" className="button primary full" type="submit" disabled={loading || !email || !password}>
            {loading ? 'Entrando…' : 'Entrar no radar'}
          </button>
          {loading && <p className="loading-inline" data-cy="login-spinner" aria-live="polite">Validando acesso…</p>}
        </form>

        <p className="credentials">analista@radarcambial.dev <span>/</span> cypress123</p>
      </section>
    </main>
  )
}
