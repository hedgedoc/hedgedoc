// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to check an external Link.
     * @example cy.get(a#extern).checkExternalLink('http://example.com')
     */
    checkExternalLink (url: string): Chainable<Element>
  }
}

Cypress.Commands.add('checkExternalLink', { prevSubject: 'element' }, ($element: JQuery, url: string) => {
  cy.wrap($element).should('have.attr', 'href', url)
    .should('have.attr', 'target', '_blank')
})
