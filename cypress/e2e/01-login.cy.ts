describe('testa autenticação', () => {

  it('exibe a tela de login', () => {
    cy.visit('/login')
  })

  it('exibe o título Radar Cambial', () => {
    cy.visit('/login')
    cy.get('h1').should('exist')
    cy.get('h1').should('have.text', 'Radar Cambial')
  })

  it('disponibiliza os campos de e-mail e senha', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
  })

  it('exibe o botão para entrar', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').should('exist')
  })

  it('mantém o botão de entrada desabilitado sem credenciais', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').should('have.attr', 'disabled')
  })

  it('apresenta a chamada e o rótulo de acesso', () => {
    cy.visit('/login')
    cy.contains('Entre para analisar').should('be.visible')
    cy.getByCy('submit-login').should('have.text', 'Entrar no radar')
  })

  it('exibe cotações após a autenticação', () => {
    cy.intercept('GET', '/api/market/quotes*', { fixture: 'quotes.json' }).as('getQuotes')
    cy.loginByApi()
    cy.wait('@getQuotes')
    cy.getByCy('quote-row').should('have.length.at.least', 1)
  })

  it('informa erro para credenciais inválidas', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('analista@radardoescambau.dev')
    cy.get('input[type="password"]').type('cypress40028922')
    cy.get('button[type="submit"]').click()
    cy.get('.alert.error').should('exist')
    cy.get('.alert.error').should('have.text', 'Credenciais inválidas.')
  })

  it('redireciona ao dashboard após autenticação válida', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('analista@radarcambial.dev')
    cy.get('input[type="password"]').type('cypress123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('envia a solicitação de autenticação e recebe um token', () => {
    cy.intercept('POST', '/api/auth/login').as('login')
    cy.visit('/login')
    cy.getByCy('email').type('analista@radarcambial.dev')
    cy.getByCy('password').type('cypress123')
    cy.getByCy('submit-login').click()

    cy.wait('@login').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200)
      expect(interception.response?.body).to.have.property('token')
    })
  })
})
