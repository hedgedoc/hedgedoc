/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Import markdown file', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  it('import on blank note', () => {
    cy.get('[data-cy="menu-import"]')
      .click()
    cy.get('[data-cy="menu-import-markdown"]')
      .click()
    cy.get('[data-cy="menu-import-markdown-input"]')
      .attachFile({ filePath: 'import.md', mimeType: 'text/markdown' })
    cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
      .should('have.text', '# Some short import test file')
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span > span')
      .should('have.text', ':)')
  })

  it('import on note with content', () => {

    cy.codemirrorFill('test\nabc')
    cy.get('[data-cy="menu-import"]')
      .click()
    cy.get('[data-cy="menu-import-markdown"]')
      .click()
    cy.get('[data-cy="menu-import-markdown-input"]')
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
