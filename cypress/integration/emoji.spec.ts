/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('emojis', () => {

  const HEDGEHOG_UNICODE_CHARACTER = '\n🦔\n'

  beforeEach(() => {
    cy.visitTestEditor()
  })

  it('renders an emoji shortcode', () => {
    cy.codemirrorFill(':hedgehog:')
    cy.getMarkdownBody()
      .should('have.text', HEDGEHOG_UNICODE_CHARACTER)
  })

  it('renders an emoji unicode character', () => {
    cy.codemirrorFill(HEDGEHOG_UNICODE_CHARACTER)
    cy.getMarkdownBody()
      .should('have.text', HEDGEHOG_UNICODE_CHARACTER)
  })

  it('renders an fork awesome icon', () => {
    cy.codemirrorFill(':fa-matrix-org:')
    cy.getMarkdownBody()
      .find('i.fa.fa-matrix-org')
      .should('be.visible')
  })
})
