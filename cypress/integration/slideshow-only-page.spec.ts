/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Slideshow only page', () => {
  it('renders slide show mode', () => {
    cy.visit('/p/test')
    cy.getReveal().should('exist')
  })
})
