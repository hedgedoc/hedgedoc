/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Renderer mode', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  it("should be 'document' without type specified", () => {
    cy.getMarkdownBody().should('exist')
  })

  it("should be 'reveal.js' with type 'slide'", () => {
    cy.setCodemirrorContent('---\ntype: slide\n---\n')
    cy.getReveal().should('exist')
  })

  it("should be 'document' with invalid type", () => {
    cy.setCodemirrorContent('---\ntype: EinDokument\n---\n')
    cy.getMarkdownBody().should('exist')
  })
})
