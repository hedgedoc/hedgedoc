/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Quote extra tags', function () {
  beforeEach(() => {
    cy.visitTestNote()
  })

  describe('Name quote tag', () => {
    it('renders correctly', () => {
      cy.setCodemirrorContent('[name=testy mctestface]')

      cy.getMarkdownBody().find('.blockquote-extra').should('be.visible').find('.fa-user').should('be.visible')

      cy.getMarkdownBody().find('.blockquote-extra').should('be.visible').contains('testy mctestface')
    })
  })

  describe('Time quote tag', () => {
    it('renders correctly', () => {
      cy.setCodemirrorContent(`[time=always]`)

      cy.getMarkdownBody().find('.blockquote-extra').should('be.visible').find('.fa-clock-o').should('be.visible')

      cy.getMarkdownBody().find('.blockquote-extra').should('be.visible').contains('always')
    })
  })

  describe('Color quote tag', () => {
    it('renders correctly', () => {
      cy.setCodemirrorContent(`[color=#b51f08]`)

      cy.getMarkdownBody().find('.blockquote-extra').should('be.visible').find('.fa-tag').should('be.visible')

      cy.getMarkdownBody().find('.blockquote-extra').should('be.visible').should('have.css', 'color', 'rgb(181, 31, 8)')
    })

    it("doesn't render in a blockquote and dyes the blockquote border", () => {
      cy.setCodemirrorContent(`> [color=#b51f08] HedgeDoc`)

      cy.getMarkdownBody().find('.blockquote-extra').should('not.exist')

      cy.getMarkdownBody()
        .find('blockquote')
        .should('be.visible')
        .should('have.css', 'border-left-color', 'rgb(181, 31, 8)')
    })
  })
})
