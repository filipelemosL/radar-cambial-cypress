const demoCredentials = {
  email: 'analista@radarcambial.dev',
  password: 'cypress123',
}

Cypress.Commands.add('getByCy', (selector: string) => cy.get(`[data-cy="${selector}"]`))

Cypress.Commands.add('loginByApi', () => {
  cy.request('POST', '/api/auth/login', demoCredentials).then(({ body }) => {
    cy.visit('/dashboard', {
      onBeforeLoad(window) {
        window.localStorage.setItem('radar-cambial-token', body.token)
      },
    })
  })
})

Cypress.Commands.add('resetLab', () => cy.request('POST', '/api/test/reset'))

Cypress.Commands.add('addPairToWatchlist', (pair: string) => {
  return cy.getByCy('quote-row')
    .filter(`[data-pair="${pair}"]`)
    .find('[data-cy="add-watchlist"]')
    .click()
})
