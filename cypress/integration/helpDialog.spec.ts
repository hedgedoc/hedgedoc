/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Help Dialog', () => {
  beforeEach(() => {
    cy.visit('/n/test')
    cy.get('.btn.active.btn-outline-secondary > i.fa-columns')
      .should('exist')
  })

  it('ToDo-List', () => {
    cy.get('.fa.fa-question-circle')
      .click()
    cy.get('input[type="checkbox"]')
      .should('exist')
      .should('not.be.checked')
  })
})
