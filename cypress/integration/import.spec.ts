/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Import markdown file', () => {
  beforeEach(() => {
    cy.visit('/n/test')
    cy.get('.btn.active.btn-outline-secondary > i.fa-columns')
      .should('exist')
    cy.get('.CodeMirror textarea')
      .type('{ctrl}a', { force: true })
      .type('{backspace}')
  })

  it('import on blank note', () => {
    cy.get('button#editor-menu-import')
      .click()
    cy.get('.import-md-file')
      .click()
    cy.get('div[aria-labelledby="editor-menu-import"] > input[type=file]')
      .attachFile({ filePath: 'import.md', mimeType: 'text/markdown' })
    cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
      .should('have.text', '# Some short import test file')
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span > span')
      .should('have.text', ':)')
  })

  it('import on note with content', () => {
    cy.get('.CodeMirror textarea')
      .type('test\nabc', { force: true })
    cy.get('button#editor-menu-import')
      .click()
    cy.get('.import-md-file')
      .click()
    cy.get('div[aria-labelledby="editor-menu-import"] > input[type=file]')
      .attachFile({ filePath: 'import.md', mimeType: 'text/markdown' })
    cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
      .should('have.text', 'test')
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span > span')
      .should('have.text', 'abc')
    cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line > span > span')
      .should('have.text', '# Some short import test file')
    cy.get('.CodeMirror-code > div:nth-of-type(4) > .CodeMirror-line > span > span')
      .should('have.text', ':)')
  })
})
