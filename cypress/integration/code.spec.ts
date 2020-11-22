/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Code', () => {
  beforeEach(() => {
    cy.visit('/n/test')
    cy.get('.btn.active.btn-outline-secondary > i.fa-columns')
      .should('exist')
    cy.get('.CodeMirror textarea')
      .type('{ctrl}a', { force: true })
      .type('{backspace}')
  })

  describe('without = doesn\'t show gutter', () => {
    it('without wrapLines active', () => {
      cy.get('.CodeMirror textarea')
        .type('```javascript \nlet x = 0\n```')
      cy.get('.markdown-body > pre > code')
        .should('have.class', 'hljs')
    })

    it('with wrapLines active', () => {
      cy.get('.CodeMirror textarea')
        .type('```javascript!\nlet x = 0\n```')
      cy.get('.markdown-body > pre > code')
        .should('have.class', 'hljs')
        .should('have.class', 'wrapLines')
    })
  })

  describe('with = shows gutter', () => {
    it('without wrapLines active', () => {
      cy.get('.CodeMirror textarea')
        .type('```javascript=\nlet x = 0\n```')
      cy.get('.markdown-body > pre > code')
        .should('have.class', 'hljs')
        .should('have.class', 'showGutter')
      cy.get('.markdown-body > pre > code > span')
        .should('have.class', 'linenumber')
        .should('have.attr', 'data-line-number', '1')
    })

    it('with wrapLines active', () => {
      cy.get('.CodeMirror textarea')
        .type('```javascript=! \nlet x = 0\n```')
      cy.get('.markdown-body > pre > code')
        .should('have.class', 'hljs')
        .should('have.class', 'showGutter')
        .should('have.class', 'wrapLines')
      cy.get('.markdown-body > pre > code > span')
        .should('have.class', 'linenumber')
        .should('have.attr', 'data-line-number', '1')
    })
  })

  describe('with = shows gutter and number is used as startline', () => {
    it('without wrapLines active', () => {
      cy.get('.CodeMirror textarea')
        .type('```javascript=100\nlet x = 0\n```')
      cy.get('.markdown-body > pre > code')
        .should('have.class', 'hljs')
        .should('have.class', 'showGutter')
      cy.get('.markdown-body > pre > code > span')
        .should('have.class', 'linenumber')
        .should('have.attr', 'data-line-number', '100')
    })

    it('with wrapLines active', () => {
      cy.get('.CodeMirror textarea')
        .type('```javascript=100! \nlet x = 0\n```')
      cy.get('.markdown-body > pre > code')
        .should('have.class', 'hljs')
        .should('have.class', 'showGutter')
        .should('have.class', 'wrapLines')
      cy.get('.markdown-body > pre > code > span')
        .should('have.class', 'linenumber')
        .should('have.attr', 'data-line-number', '100')
    })
  })

  it('has a button', () => {
    cy.get('.CodeMirror textarea')
      .type('```javascript \nlet x = 0\n```')
    cy.get('.markdown-body > pre > div > button > i')
      .should('have.class', 'fa-files-o')
      .click()
    // This line can be activated if cypress supports copy to clipboard in firefox, too.
    // Please run `yarn add --dev clipboardy`
    // uncomment cypress plugin
    // cy.task('getClipboard').should('contain', 'let x = 0\n');
  })
})
