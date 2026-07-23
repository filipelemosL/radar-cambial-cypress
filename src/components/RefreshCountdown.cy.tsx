import RefreshCountdown from './RefreshCountdown'

describe('<RefreshCountdown />', () => {
  it('atualiza ao fim do contador sem esperar tempo real', () => {
    const refresh = cy.stub().as('refresh')
    cy.clock()
    cy.mount(<RefreshCountdown seconds={5} onRefresh={refresh} />)

    cy.getByCy('refresh-countdown').should('contain.text', '5s')
    cy.tick(5_000)
    cy.get('@refresh').should('have.been.calledOnce')
    cy.getByCy('refresh-countdown').should('contain.text', '5s')
  })
})
