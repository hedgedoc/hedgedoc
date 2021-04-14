/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Editor mode from URL parameter is used', () => {
  it('mode view', () => {
    cy.visitTestEditor('view')
    cy.get('.splitter.left')
      .should('have.class', 'd-none')
    cy.get('.splitter.right')
      .should('not.have.class', 'd-none')
  })
  it('mode both', () => {
    cy.visitTestEditor('both')
    cy.get('.splitter.left')
      .should('not.have.class', 'd-none')
    cy.get('.splitter.separator')
      .should('exist')
    cy.get('.splitter.right')
      .should('not.have.class', 'd-none')
  })
  it('mode edit', () => {
    cy.visitTestEditor('edit')
    cy.get('.splitter.left')
      .should('not.have.class', 'd-none')
    cy.get('.splitter.right')
      .should('have.class', 'd-none')
  })
})
