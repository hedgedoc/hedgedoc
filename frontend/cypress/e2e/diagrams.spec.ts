/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Diagram codeblock ', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  it('renders mermaid', () => {
    cy.setCodemirrorContent('```mermaid\ngraph TD;\n    A-->B;\n```')
    cy.getMarkdownBody().findByCypressId('mermaid-frame').children().should('be.visible')
  })
})
