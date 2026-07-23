const credentials = {
  email: 'analista@radarcambial.dev',
  password: 'cypress123',
}

describe('Lista pessoal e autenticação pela API', () => {
  beforeEach(() => {
    cy.request('POST', '/api/test/reset')
    cy.intercept('GET', '/api/market/quotes*', { fixture: 'quotes.json' }).as('getQuotes')
  })

  it('retorna um token ao autenticar pela API', () => {
    cy.request('POST', '/api/auth/login', credentials).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.token).to.be.a('string').and.not.be.empty
    })
  })

  it('retorna o usuário autenticado com o token recebido', () => {
    cy.request('POST', '/api/auth/login', credentials).then(({ body }) => {
      cy.request({
        method: 'GET',
        url: '/api/auth/me',
        headers: { Authorization: `Bearer ${body.token}` },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.include({
          name: 'Analista Cypress',
          email: 'analista@radarcambial.dev',
        })
      })
    })
  })

  it('exibe no dashboard o par criado pela API', () => {
    cy.request('POST', '/api/auth/login', credentials).then(({ body }) => {
      cy.request({
        method: 'POST',
        url: '/api/watchlist',
        headers: { Authorization: `Bearer ${body.token}` },
        body: { pair: 'USD/BRL', rate: 5.1 },
      }).its('status').should('eq', 201)

      cy.visit('/dashboard', {
        onBeforeLoad(window) {
          window.localStorage.setItem('radar-cambial-token', body.token)
        },
      })
    })

    cy.wait('@getQuotes')
    cy.getByCy('watchlist-item').should('contain.text', 'USD/BRL')
  })

  it('mantém token no localstorage com cy.session()', () => {
    cy.session('analista-cypress', () => {
      cy.request('POST', '/api/auth/login', credentials).then(({ body }) => {
        cy.visit('/login')
        cy.window().then((window) => {
          window.localStorage.setItem('radar-cambial-token', body.token)
        })
      })
    })

    cy.visit('/dashboard')
    cy.wait('@getQuotes')
    cy.window().then((window) => {
      expect(window.localStorage.getItem('radar-cambial-token')).to.be.a('string').and.not.be.empty
    })
    cy.getByCy('logout').should('be.visible')
  })

  it('adiciona um par pela interface com comando reutilizável', () => {
    cy.loginByApi()
    cy.wait('@getQuotes')
    cy.addPairToWatchlist('USD/EUR')

    cy.getByCy('toast').should('contain.text', 'USD/EUR foi adicionado')
    cy.getByCy('watchlist-item').should('contain.text', 'USD/EUR')
  })

  it('inicia com a lista vazia, mesmo após outro cenário adicionar pares', () => {
    cy.loginByApi()
    cy.wait('@getQuotes')

    cy.getByCy('watchlist-empty').should('be.visible')
    cy.getByCy('watchlist-item').should('not.exist')
  })
})
