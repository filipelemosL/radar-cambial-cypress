describe('Interações do dashboard', () => {
  beforeEach(() => {
    cy.resetLab()
    cy.intercept('GET', '/api/market/quotes*', { fixture: 'quotes.json' }).as('getQuotes')

    
    cy.loginByApi()
    cy.wait('@getQuotes')
  })

  it('altera a moeda base e consulta o mercado com o novo parâmetro', () => {
    cy.intercept({
      method: 'GET',
      pathname: '/api/market/quotes',
      query: { base: 'BRL' },
    }).as('getBrlQuotes')

    cy.getByCy('market-base').select('BRL').should('have.value', 'BRL')

    cy.wait('@getBrlQuotes').its('request.url').should('include', 'base=BRL')
  })

  it('permite desmarcar e marcar uma moeda de comparação', () => {
    cy.getByCy('currency-EUR').uncheck().should('not.be.checked')
    cy.getByCy('currency-EUR').check().should('be.checked')
  })

  it('filtra as cotações pelo par informado', () => {
    cy.getByCy('quote-search').type('USD/BRL')

    cy.getByCy('quote-row')
      .should('have.length', 1)
      .and('have.attr', 'data-pair', 'USD/BRL')
  })

  it('exibe um estado vazio quando não há pares para o filtro', () => {
    cy.getByCy('quote-search').type('CAD')

    cy.getByCy('quote-row').should('not.exist')
    cy.getByCy('empty-quotes').should('contain.text', 'Nenhum par corresponde ao filtro atual.')
  })
  it('ordena as cotações da maior para a menor taxa', () => {
    cy.getByCy('sort-quotes').select('rate-desc').should('have.value', 'rate-desc')

    cy.getByCy('quote-row')
      .should('have.length', 3)
      .first()
      .should('have.attr', 'data-pair', 'USD/JPY')
  })
  it('adiciona um par à análise e desabilita a ação duplicada', () => {
    cy.get('[data-cy="quote-row"][data-pair="USD/BRL"]')
      .find('[data-cy="add-watchlist"]')
      .click()

    cy.getByCy('toast').should('contain.text', 'USD/BRL foi adicionado à sua análise.')
    cy.getByCy('watchlist-item').should('contain.text', 'USD/BRL')
    cy.get('[data-cy="quote-row"][data-pair="USD/BRL"]')
      .find('[data-cy="add-watchlist"]')
      .should('be.disabled')
      .and('have.text', 'Na análise')
  })

  it('remove um par salvo e volta ao estado de lista vazia', () => {
    cy.addPairToWatchlist('USD/EUR')
    cy.getByCy('watchlist-item').should('contain.text', 'USD/EUR')

    cy.getByCy('watchlist-remove').click()

    cy.getByCy('watchlist-empty').should('be.visible')
    cy.getByCy('watchlist-total').should('have.text', '0 pares')
  })

  it('abre e fecha o histórico de uma cotação', () => {
    cy.intercept('GET', '/api/market/history*', {
      body: {
        pair: 'USD/BRL',
        points: [{ date: '2026-07-20', rate: 5.1 }],
        source: 'Fixture Cypress',
      },
    }).as('getHistory')

    cy.get('[data-cy="quote-row"][data-pair="USD/BRL"]')
      .find('[data-cy="view-history"]')
      .click()

    cy.wait('@getHistory')
    cy.getByCy('history-modal').should('be.visible')

    cy.getByCy('close-history').click()
    cy.getByCy('history-modal').should('not.exist')
  })

  it('encerra a sessão e retorna à tela de login', () => {
    cy.getByCy('logout').click()

    cy.location('pathname').should('eq', '/login')



    cy.getByCy('submit-login').should('be.visible')
  })
})
