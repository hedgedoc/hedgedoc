/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Short code', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  describe('for pdfs', () => {
    it('renders a plain link', () => {
      cy.codemirrorFill(`{%pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf %}`)
      cy.getMarkdownBody()
        .find('a')
        .should('have.attr', 'href', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
    })
  })
})
