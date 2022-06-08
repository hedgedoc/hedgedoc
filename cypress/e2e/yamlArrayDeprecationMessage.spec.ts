/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('YAML Array for deprecated syntax of document tags in frontmatter', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  it('is shown when using old syntax', () => {
    cy.setCodemirrorContent('---\ntags: a, b, c\n---')
    cy.getIframeBody().findByCypressId('yamlArrayDeprecationAlert').should('be.visible')
  })

  it("isn't shown when using inline yaml-array", () => {
    cy.setCodemirrorContent("---\ntags: ['a', 'b', 'c']\n---")
    cy.getIframeBody().findByCypressId('yamlArrayDeprecationAlert').should('not.exist')
  })

  it("isn't shown when using multi line yaml-array", () => {
    cy.setCodemirrorContent('---\ntags:\n  - a\n  - b\n  - c\n---')
    cy.getIframeBody().findByCypressId('yamlArrayDeprecationAlert').should('not.exist')
  })
})
