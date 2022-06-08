/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
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
    cy.get('.cm-editor .cm-line:nth-child(1)').should('have.text', '# Some short import test file')
    cy.get('.cm-editor .cm-line:nth-child(2)').should('have.text', ':)')
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
    cy.get('.cm-editor .cm-line:nth-child(1)').should('have.text', 'test')
    cy.get('.cm-editor .cm-line:nth-child(2)').should('have.text', 'abc')
    cy.get('.cm-editor .cm-line:nth-child(3)').should('have.text', '# Some short import test file')
    cy.get('.cm-editor .cm-line:nth-child(4)').should('have.text', ':)')
  })
})
