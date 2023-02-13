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

describe('License frontmatter', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  it('sets the link tag if defined and not blank', () => {
    cy.setCodemirrorContent('---\nlicense: https://example.com\n---')
    cy.get('link[rel="license"]').should('have.attr', 'href', 'https://example.com')
  })

  it('does not set the link tag if not defined', () => {
    cy.setCodemirrorContent('---\ntitle: No license for this note\n---')
    cy.get('link[rel="license"]').should('not.exist')
  })

  it('does not set the link tag if defined but blank', () => {
    cy.setCodemirrorContent('---\nlicense: \n---')
    cy.get('link[rel="license"]').should('not.exist')
  })
})
