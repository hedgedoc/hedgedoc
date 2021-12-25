/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const findHljsCodeBlock = () => {
  return cy.getMarkdownBody().findByCypressId('code-highlighter').should('be.visible')
}

describe('Code', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  describe('with just the language', () => {
    it("doesn't show a gutter", () => {
      cy.setCodemirrorContent('```javascript \nlet x = 0\n```')
      findHljsCodeBlock().should('have.attr', 'data-cypress-showgutter', 'false')

      findHljsCodeBlock().findByCypressId('linenumber').should('not.be.visible')
    })

    describe('and line wrapping', () => {
      it("doesn't show a gutter", () => {
        cy.setCodemirrorContent('```javascript! \nlet x = 0\n```')
        findHljsCodeBlock().should('have.attr', 'data-cypress-showgutter', 'false')
        findHljsCodeBlock().should('have.attr', 'data-cypress-wrapLines', 'true')

        findHljsCodeBlock().findByCypressId('linenumber').should('not.be.visible')
      })
    })
  })

  describe('with the language and show gutter', () => {
    it('shows the correct line number', () => {
      cy.setCodemirrorContent('```javascript= \nlet x = 0\n```')
      findHljsCodeBlock().should('have.attr', 'data-cypress-showgutter', 'true')

      findHljsCodeBlock().findByCypressId('linenumber').should('be.visible').text().should('eq', '1')
    })

    describe('and line wrapping', () => {
      it('shows the correct line number', () => {
        cy.setCodemirrorContent('```javascript=! \nlet x = 0\n```')
        findHljsCodeBlock().should('have.attr', 'data-cypress-showgutter', 'true')
        findHljsCodeBlock().should('have.attr', 'data-cypress-wrapLines', 'true')

        findHljsCodeBlock().findByCypressId('linenumber').should('be.visible').text().should('eq', '1')
      })
    })
  })

  describe('with the language, show gutter with a start number', () => {
    it('shows the correct line number', () => {
      cy.setCodemirrorContent('```javascript=100 \nlet x = 0\n```')
      findHljsCodeBlock().should('have.attr', 'data-cypress-showgutter', 'true')

      findHljsCodeBlock().findByCypressId('linenumber').should('be.visible').text().should('eq', '100')
    })

    it('shows the correct line number and continues in another codeblock', () => {
      cy.setCodemirrorContent('```javascript=100 \nlet x = 0\nlet y = 1\n```\n\n```javascript=+\nlet y = 2\n```\n')
      findHljsCodeBlock().should('have.attr', 'data-cypress-showgutter', 'true')
      findHljsCodeBlock().first().findByCypressId('linenumber').first().should('be.visible').text().should('eq', '100')
      findHljsCodeBlock().first().findByCypressId('linenumber').last().should('be.visible').text().should('eq', '101')
      findHljsCodeBlock().last().findByCypressId('linenumber').first().should('be.visible').text().should('eq', '102')
    })

    describe('and line wrapping', () => {
      it('shows the correct line number', () => {
        cy.setCodemirrorContent('```javascript=100! \nlet x = 0\n```')
        findHljsCodeBlock().should('have.attr', 'data-cypress-showgutter', 'true')
        findHljsCodeBlock().should('have.attr', 'data-cypress-wrapLines', 'true')
        findHljsCodeBlock().findByCypressId('linenumber').should('be.visible').text().should('eq', '100')
      })

      it('shows the correct line number and continues in another codeblock', () => {
        cy.setCodemirrorContent('```javascript=100! \nlet x = 0\nlet y = 1\n```\n\n```javascript=+\nlet y = 2\n```\n')
        findHljsCodeBlock().should('have.attr', 'data-cypress-showgutter', 'true')
        findHljsCodeBlock().should('have.attr', 'data-cypress-wrapLines', 'true')
        findHljsCodeBlock()
          .first()
          .findByCypressId('linenumber')
          .first()
          .should('be.visible')
          .text()
          .should('eq', '100')
        findHljsCodeBlock().first().findByCypressId('linenumber').last().should('be.visible').text().should('eq', '101')
        findHljsCodeBlock().last().findByCypressId('linenumber').first().should('be.visible').text().should('eq', '102')
      })
    })
  })

  it('has a working copy button', () => {
    cy.setCodemirrorContent('```javascript \nlet x = 0\n```')

    cy.getByCypressId('documentIframe').then((element: JQuery<HTMLElement>) => {
      const frame = element.get(0) as HTMLIFrameElement
      if (frame === null || frame.contentWindow === null) {
        return cy.wrap(null)
      }

      cy.spy(frame.contentWindow.navigator.clipboard, 'writeText').as('copy')
    })

    cy.getIframeBody().findByCypressId('copy-code-button').click()

    cy.get('@copy').should('be.calledWithExactly', 'let x = 0\n')
  })
})
