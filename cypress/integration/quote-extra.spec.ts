/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Quote extra tags', function () {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  describe('Name quote tag', () => {
    it('renders correctly', () => {
      cy.codemirrorFill('[name=testy mctestface]')

      cy.getMarkdownBody()
        .find('.quote-extra')
        .should('be.visible')
        .find('.fa-user')
        .should('be.visible')

      cy.getMarkdownBody()
        .find('.quote-extra')
        .should('be.visible')
        .contains('testy mctestface')
    })
  })

  describe('Time quote tag', () => {
    it('renders correctly', () => {
      cy.codemirrorFill(`[time=always]`)

      cy.getMarkdownBody()
        .find('.quote-extra')
        .should('be.visible')
        .find('.fa-clock-o')
        .should('be.visible')

      cy.getMarkdownBody()
        .find('.quote-extra')
        .should('be.visible')
        .contains('always')
    })
  })

  describe('Color quote tag', () => {
    it('renders correctly', () => {
      cy.codemirrorFill(`[color=#b51f08]`)

      cy.getMarkdownBody()
        .find('.quote-extra')
        .should('be.visible')
        .find('.fa-tag')
        .should('be.visible')

      cy.getMarkdownBody()
        .find('.quote-extra')
        .should('be.visible')
        .should('have.css', 'color', 'rgb(181, 31, 8)')
    })

    it('doesn\'t render in a blockquote and dyes the blockquote border', () => {
      cy.codemirrorFill(`> [color=#b51f08] HedgeDoc`)

      cy.getMarkdownBody()
        .find('.quote-extra')
        .should('not.exist')

      cy.getMarkdownBody()
        .find('blockquote')
        .should('be.visible')
        .should('have.css', 'border-left-color', 'rgb(181, 31, 8)')
    })
  })
})
