/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Help Dialog', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  it('ToDo-List', () => {
    cy.getByCypressId('editor-help-button').click()
    cy.get('input[type="checkbox"]').should('exist').should('not.be.checked')
  })
})
