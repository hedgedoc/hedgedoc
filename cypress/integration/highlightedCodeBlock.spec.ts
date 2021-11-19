/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const findHljsCodeBlock = () => {
  return cy.getMarkdownBody().find('.code-highlighter > code.hljs').should('be.visible')
}

describe('Code', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  describe('with just the language', () => {
    it("doesn't show a gutter", () => {
      cy.setCodemirrorContent('```javascript \nlet x = 0\n```')
      findHljsCodeBlock().should('not.have.class', 'showGutter')

      findHljsCodeBlock().find('.linenumber').should('not.be.visible')
    })

    describe('and line wrapping', () => {
      it("doesn't show a gutter", () => {
        cy.setCodemirrorContent('```javascript! \nlet x = 0\n```')
        findHljsCodeBlock().should('not.have.class', 'showGutter').should('have.class', 'wrapLines')

        findHljsCodeBlock().find('.linenumber').should('not.be.visible')
      })
    })
  })

  describe('with the language and show gutter', () => {
    it('shows the correct line number', () => {
      cy.setCodemirrorContent('```javascript= \nlet x = 0\n```')
      findHljsCodeBlock().should('have.class', 'showGutter')

      findHljsCodeBlock().find('.linenumber').should('be.visible').text().should('eq', '1')
    })

    describe('and line wrapping', () => {
      it('shows the correct line number', () => {
        cy.setCodemirrorContent('```javascript=! \nlet x = 0\n```')
        findHljsCodeBlock().should('have.class', 'showGutter').should('have.class', 'wrapLines')

        findHljsCodeBlock().find('.linenumber').should('be.visible').text().should('eq', '1')
      })
    })
  })

  describe('with the language, show gutter with a start number', () => {
    it('shows the correct line number', () => {
      cy.setCodemirrorContent('```javascript=100 \nlet x = 0\n```')
      findHljsCodeBlock().should('have.class', 'showGutter')

      findHljsCodeBlock().find('.linenumber').should('be.visible').text().should('eq', '100')
    })

    it('shows the correct line number and continues in another codeblock', () => {
      cy.setCodemirrorContent('```javascript=100 \nlet x = 0\nlet y = 1\n```\n\n```javascript=+\nlet y = 2\n```\n')
      findHljsCodeBlock()
        .should('have.class', 'showGutter')
        .first()
        .find('.linenumber')
        .first()
        .should('be.visible')
        .text()
        .should('eq', '100')
      findHljsCodeBlock().first().find('.linenumber').last().should('be.visible').text().should('eq', '101')
      findHljsCodeBlock().last().find('.linenumber').first().should('be.visible').text().should('eq', '102')
    })

    describe('and line wrapping', () => {
      it('shows the correct line number', () => {
        cy.setCodemirrorContent('```javascript=100! \nlet x = 0\n```')
        findHljsCodeBlock().should('have.class', 'showGutter').should('have.class', 'wrapLines')
        findHljsCodeBlock().find('.linenumber').should('be.visible').text().should('eq', '100')
      })

      it('shows the correct line number and continues in another codeblock', () => {
        cy.setCodemirrorContent('```javascript=100! \nlet x = 0\nlet y = 1\n```\n\n```javascript=+\nlet y = 2\n```\n')
        findHljsCodeBlock()
          .should('have.class', 'showGutter')
          .should('have.class', 'wrapLines')
          .first()
          .find('.linenumber')
          .first()
          .should('be.visible')
          .text()
          .should('eq', '100')
        findHljsCodeBlock().first().find('.linenumber').last().should('be.visible').text().should('eq', '101')
        findHljsCodeBlock().last().find('.linenumber').first().should('be.visible').text().should('eq', '102')
      })
    })
  })

  it('has a working copy button', () => {
    cy.setCodemirrorContent('```javascript \nlet x = 0\n```')

    cy.getById('documentIframe').then((element: JQuery<HTMLElement>) => {
      const frame = element.get(0) as HTMLIFrameElement
      if (frame === null || frame.contentWindow === null) {
        return cy.wrap(null)
      }

      cy.spy(frame.contentWindow.navigator.clipboard, 'writeText').as('copy')
    })

    cy.getIframeBody().findById('copy-code-button').click()

    cy.get('@copy').should('be.calledWithExactly', 'let x = 0\n')
  })
})
