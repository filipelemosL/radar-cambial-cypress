type QuoteFixture = {
  quotes: Array<{ pair: string; symbol: string; rate: number; change: number | null }>
}

describe('Consulta de cotações e integração de rede', () => {
  beforeEach(() => {
    cy.request('POST', '/api/test/reset')
    cy.intercept('GET', '/api/market/quotes*', { fixture: 'quotes.json' }).as('getQuotes')
  })

  it('exibe a média das cotações em dolar americano', () => {
    cy.loginByApi()
    cy.wait('@getQuotes')

    cy.getByCy('quote-row').first().as('firstQuote')
    cy.get('@firstQuote').should('contain.text', 'USD/BRL')

    cy.getByCy('average-rate')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain('US$')
      })
  })

  it('exibe o indicador de carregamento durante a consulta', () => {
    cy.intercept('GET', '/api/market/quotes*', {
      fixture: 'quotes.json',
      delay: 500,
    }).as('slowQuotes')

    cy.loginByApi()
    cy.getByCy('market-spinner').should('be.visible')
    cy.wait('@slowQuotes')
    cy.getByCy('market-spinner').should('not.exist')
  })

  it('exibe uma mensagem de alerta quando a consulta falha', () => {
    cy.intercept('GET', '/api/market/quotes*', {
      statusCode: 500,
      body: { message: 'Não foi possível consultar as cotações.' },
    }).as('failedQuotes')

    cy.loginByApi()
    cy.wait('@failedQuotes')
    cy.getByCy('market-error').should('have.text', 'Não foi possível consultar as cotações.')
  })

  it('exibe os três pares definidos na fixture', () => {
    cy.fixture<QuoteFixture>('quotes.json').then((market) => {
      const pairs = market.quotes.map((quote) => quote.pair)

      expect(pairs).to.deep.equal(['USD/BRL', 'USD/EUR', 'USD/JPY'])
    })

    cy.loginByApi()
    cy.wait('@getQuotes')
    cy.getByCy('quote-row').should('have.length', 3)
  })

  it('autentica pela interface e recebe resposta de sucesso da API', () => {
    cy.intercept('POST', '/api/auth/login').as('login')
    cy.visit('/login')
    cy.getByCy('email').as('email')
    cy.getByCy('password').as('password')

    cy.get('@email').type('analista@radarcambial.dev')
    cy.get('@password').type('cypress123')
    cy.getByCy('submit-login').click()

    cy.wait('@login').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/dashboard')
  })

  it('envia o par de cotações selecionados e o exibe na lista pessoal', () => {
    cy.intercept('POST', '/api/watchlist', (request) => {
      expect(request.body).to.deep.equal({ pair: 'USD/BRL', rate: 5.1 })
      request.continue()
    }).as('addWatchlist')

    cy.loginByApi()
    cy.wait('@getQuotes')
    cy.get('[data-cy="quote-row"][data-pair="USD/BRL"]')
      .find('[data-cy="add-watchlist"]')
      .click()

    cy.wait('@addWatchlist').its('response.statusCode').should('eq', 201)
    cy.getByCy('watchlist-item').should('contain.text', 'USD/BRL')
  })

  it('carrega o histórico ao abrir uma cotação', () => {
    cy.intercept('GET', '/api/market/history*', {
      statusCode: 200,
      body: {
        pair: 'USD/BRL',
        points: [{ date: '2026-07-20', rate: 5.1 }],
        source: 'Fixture Cypress',
      },
    }).as('getHistory')

    cy.loginByApi()
    cy.wait('@getQuotes')
    cy.get('[data-cy="quote-row"][data-pair="USD/BRL"]')
      .find('[data-cy="view-history"]')
      .click()

    cy.wait('@getHistory').its('request.url').should('include', 'base=USD&symbol=BRL')
    cy.getByCy('history-modal').should('be.visible')
  })
})
