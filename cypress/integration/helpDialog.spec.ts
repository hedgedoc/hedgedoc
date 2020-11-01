describe('Help Dialog', () => {
  beforeEach(() => {
    cy.visit('/n/test')
    cy.get('.btn.active.btn-outline-secondary > i.fa-columns')
      .should('exist')
  })

  it('ToDo-List', () => {
    cy.get('.fa.fa-question-circle')
      .click()
    cy.get('input[type="checkbox"]')
      .should('exist')
      .should('not.be.checked')
  })
})
