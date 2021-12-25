/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Short code gets replaced or rendered: ', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  describe('pdf', () => {
    it('renders a plain link', () => {
      cy.setCodemirrorContent(`{%pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf %}`)
      cy.getMarkdownBody()
        .find('a')
        .should('have.attr', 'href', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
    })
  })

  describe('slideshare', () => {
    it('renders a plain link', () => {
      cy.setCodemirrorContent(`{%slideshare example/123456789 %}`)
      cy.getMarkdownBody().find('a').should('have.attr', 'href', 'https://www.slideshare.net/example/123456789')
    })
  })

  describe('speakerdeck', () => {
    it('renders a plain link', () => {
      cy.setCodemirrorContent(`{%speakerdeck example/123456789 %}`)
      cy.getMarkdownBody().find('a').should('have.attr', 'href', 'https://speakerdeck.com/example/123456789')
    })
  })

  describe('youtube', () => {
    it('renders click-shield', () => {
      cy.setCodemirrorContent(`{%youtube YE7VzlLtp-4 %}`)
      cy.getMarkdownBody().findByCypressId('click-shield-youtube')
    })
  })
})
