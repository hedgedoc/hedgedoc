/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Opengraph metadata', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  it('includes the note title if not overridden', () => {
    cy.setCodemirrorContent('---\ntitle: Test title\n---')
    cy.get('meta[property="og:title"]').should('have.attr', 'content', 'Test title')
  })

  it('includes the note title if overridden', () => {
    cy.setCodemirrorContent('---\ntitle: Test title\nopengraph:\n  title: Overridden title\n---')
    cy.get('meta[property="og:title"]').should('have.attr', 'content', 'Overridden title')
  })

  it('includes custom opengraph tags', () => {
    cy.setCodemirrorContent('---\nopengraph:\n  image: https://dummyimage.com/48\n---')
    cy.get('meta[property="og:image"]').should('have.attr', 'content', 'https://dummyimage.com/48')
  })
})
