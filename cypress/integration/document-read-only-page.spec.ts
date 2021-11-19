/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Document read only page', () => {
  it('renders the document mode', () => {
    cy.visit('/s/test')
    cy.getMarkdownBody().should('exist')
  })
})
