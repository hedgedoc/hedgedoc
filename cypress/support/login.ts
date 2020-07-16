// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log the user out.
     * @example cy.logout()
     */
    logout (): Chainable<Window>
  }
}

Cypress.Commands.add('logout', () => {
  cy.get('#dropdown-user').click()
  cy.get('.fa-sign-out').click()
})
