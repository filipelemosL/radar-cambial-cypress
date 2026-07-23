declare namespace Cypress {
  interface Chainable {
    /** Busca elementos por seu seletor estável data-cy. */
    getByCy(selector: string): Chainable<JQuery<HTMLElement>>
    /** Cria uma sessão no dashboard usando a API local de demonstração. */
    loginByApi(): Chainable<void>
    /** Limpa a lista em memória da API local para manter testes independentes. */
    resetLab(): Chainable<Cypress.Response<unknown>>
    addPairToWatchlist(pair: string): Chainable<JQuery<HTMLElement>>
    mount: typeof import('cypress/react').mount
  }
}
