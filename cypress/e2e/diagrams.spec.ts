/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Diagram codeblock ', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  /*
   TODO: Readd test after fixing https://github.com/hedgedoc/react-client/issues/1709
   it('renders markmap', () => {
   cy.setCodemirrorContent('```markmap\n- pro\n- contra\n```')
   cy.getMarkdownBody().findByCypressId('markmap').children().should('be.visible')
   })
   */

  it('renders mermaid', () => {
    cy.setCodemirrorContent('```mermaid\ngraph TD;\n    A-->B;\n```')
    cy.getMarkdownBody().findByCypressId('mermaid-frame').children().should('be.visible')
  })
})
