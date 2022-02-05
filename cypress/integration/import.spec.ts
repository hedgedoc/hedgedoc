/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Import markdown file', () => {
  beforeEach(() => {
    cy.visitTestNote()
    cy.fixture('import.md').as('import')
  })

  it('import on blank note', () => {
    cy.getByCypressId('menu-import').click()
    cy.getByCypressId('menu-import-markdown-button').should('be.visible')
    cy.getByCypressId('menu-import-markdown-input').selectFile(
      {
        contents: '@import',
        fileName: 'import.md',
        mimeType: 'text/markdown'
      },
      { force: true }
    )
    cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span').should(
      'have.text',
      '# Some short import test file'
    )
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span > span').should('have.text', ':)')
  })

  it('import on note with content', () => {
    cy.setCodemirrorContent('test\nabc')
    cy.getByCypressId('menu-import').click()
    cy.getByCypressId('menu-import-markdown-button').should('be.visible')
    cy.getByCypressId('menu-import-markdown-input').selectFile(
      {
        contents: '@import',
        fileName: 'import.md',
        mimeType: 'text/markdown'
      },
      { force: true }
    )
    cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span').should('have.text', 'test')
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span > span').should('have.text', 'abc')
    cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line > span > span').should(
      'have.text',
      '# Some short import test file'
    )
    cy.get('.CodeMirror-code > div:nth-of-type(4) > .CodeMirror-line > span > span').should('have.text', ':)')
  })
})
