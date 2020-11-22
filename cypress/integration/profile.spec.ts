/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('profile page', () => {
  beforeEach(() => {
    cy.route({
      url: '/api/v2/tokens',
      method: 'GET',
      response: [
        {
          label: "cypress-App",
          created: 1601991518
        }
      ]
    })
    cy.route({
      url: '/api/v2/tokens',
      method: 'POST',
      response: {
        label: 'cypress',
        secret: 'c-y-p-r-e-s-s',
        created: Date.now()
      }
    })
    cy.route({
      url: '/api/v2/tokens/1601991518',
      method: 'DELETE',
      response: []
    })
    cy.visit('/profile')
  })

  describe('access tokens', () => {
    it('list existing tokens', () => {
      cy.get('.card.access-tokens .list-group-item .text-start.col')
        .contains('cypress-App')
    })

    it('delete token', () => {
      cy.get('.card.access-tokens .list-group-item .btn-danger')
        .click()
      cy.get('.modal-dialog')
        .should('be.visible')
        .get('.modal-footer .btn-danger')
        .click()
      cy.get('.modal-dialog')
        .should('not.be.visible')
    })

    it('add token', () => {
      cy.get('.card.access-tokens .btn-primary')
        .should('be.disabled')
      cy.get('.card.access-tokens input[type=text]')
        .type('cypress')
      cy.get('.card.access-tokens .btn-primary')
        .should('not.be.disabled')
        .click()
      cy.get('.modal-dialog')
        .should('be.visible')
        .get('.modal-dialog input[readonly]')
        .should('have.value', 'c-y-p-r-e-s-s')
    })
  })
})
