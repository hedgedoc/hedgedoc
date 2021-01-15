/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Code', () => {
  beforeEach(() => {
    cy.visit('/n/test', {
      onBeforeLoad (win: Window): void {
        cy.spy(win.navigator.clipboard, 'writeText').as('copy')
      }
    })
  })

  describe('with just the language', () => {
    it('doesn\'t show a gutter', () => {
      cy.codemirrorFill('```javascript \nlet x = 0\n```')
      cy.get('.markdown-body > pre > code.hljs')
        .should('be.visible')
        .should('not.have.class', 'showGutter')
      cy.get('.markdown-body > pre > code.hljs > .linenumber')
        .should('not.be.visible')
    })

    describe('and line wrapping', () => {
      it('doesn\'t show a gutter', () => {
        cy.codemirrorFill('```javascript! \nlet x = 0\n```')
        cy.get('.markdown-body > pre > code.hljs')
          .should('be.visible')
          .should('not.have.class', 'showGutter')
          .should('have.class', 'wrapLines')
        cy.get('.markdown-body > pre > code.hljs > .linenumber')
          .should('not.be.visible')
      })
    })
  })

  describe('with the language and show gutter', () => {
    it('shows the correct line number', () => {
      cy.codemirrorFill('```javascript= \nlet x = 0\n```')
      cy.get('.markdown-body > pre > code.hljs')
        .should('be.visible')
        .should('have.class', 'showGutter')
      cy.get('.markdown-body > pre > code.hljs > .linenumber')
        .should('be.visible')
        .text()
        .should('eq', '1')
    })

    describe('and line wrapping', () => {
      it('shows the correct line number', () => {
        cy.codemirrorFill('```javascript=! \nlet x = 0\n```')
        cy.get('.markdown-body > pre > code.hljs')
          .should('be.visible')
          .should('have.class', 'showGutter')
          .should('have.class', 'wrapLines')
        cy.get('.markdown-body > pre > code.hljs > .linenumber')
          .should('be.visible')
          .text()
          .should('eq', '1')
      })
    })
  })

  describe('with the language, show gutter with a start number', () => {
    it('shows the correct line number', () => {
      cy.codemirrorFill('```javascript=100 \nlet x = 0\n```')
      cy.get('.markdown-body > pre > code.hljs')
        .should('be.visible')
        .should('have.class', 'showGutter')
      cy.get('.markdown-body > pre > code.hljs > .linenumber')
        .should('be.visible')
        .text()
        .should('eq', '100')
    })

    it('shows the correct line number and continues in another codeblock', () => {
      cy.codemirrorFill('```javascript=100 \nlet x = 0\nlet y = 1\n```\n\n```javascript=+\nlet y = 2\n```\n')
      cy.get('.markdown-body > pre > code.hljs')
        .should('be.visible')
        .should('have.class', 'showGutter')
        .first()
        .find('.linenumber')
        .first()
        .should('be.visible')
        .text()
        .should('eq', '100')
      cy.get('.markdown-body > pre > code.hljs')
        .first()
        .find('.linenumber')
        .last()
        .should('be.visible')
        .text()
        .should('eq', '101')
      cy.get('.markdown-body > pre > code.hljs')
        .last()
        .find('.linenumber')
        .first()
        .should('be.visible')
        .text()
        .should('eq', '102')
    })

    describe('and line wrapping', () => {
      it('shows the correct line number', () => {
        cy.codemirrorFill('```javascript=100! \nlet x = 0\n```')
        cy.get('.markdown-body > pre > code.hljs')
          .should('be.visible')
          .should('have.class', 'showGutter')
          .should('have.class', 'wrapLines')
        cy.get('.markdown-body > pre > code.hljs > .linenumber')
          .should('be.visible')
          .text()
          .should('eq', '100')
      })

      it('shows the correct line number and continues in another codeblock', () => {
        cy.codemirrorFill('```javascript=100! \nlet x = 0\nlet y = 1\n```\n\n```javascript=+\nlet y = 2\n```\n')
        cy.get('.markdown-body > pre > code.hljs')
          .should('be.visible')
          .should('have.class', 'showGutter')
          .should('have.class', 'wrapLines')
          .first()
          .find('.linenumber')
          .first()
          .should('be.visible')
          .text()
          .should('eq', '100')
        cy.get('.markdown-body > pre > code.hljs')
          .first()
          .find('.linenumber')
          .last()
          .should('be.visible')
          .text()
          .should('eq', '101')
        cy.get('.markdown-body > pre > code.hljs')
          .last()
          .find('.linenumber')
          .first()
          .should('be.visible')
          .text()
          .should('eq', '102')
      })
    })
  })

  it('has a working copy button', () => {
    cy.codemirrorFill('```javascript \nlet x = 0\n```')
    cy.get('.markdown-body > pre > div > button > i')
      .should('have.class', 'fa-files-o')
      .click()
    cy.get('@copy').should('be.calledWithExactly', 'let x = 0\n')
  })
})
