/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('profile page', () => {
  beforeEach(() => {
    cy.intercept(
      {
        url: '/mock-backend/api/private/tokens',
        method: 'GET'
      },
      {
        body: [
          {
            label: 'cypress-App',
            keyId: 'cypress',
            createdAt: '2021-11-21T01:11:12+01:00',
            lastUsed: '2021-11-21T01:11:12+01:00',
            validUntil: '2023-11-21'
          }
        ]
      }
    )
    cy.intercept(
      {
        url: '/mock-backend/api/private/tokens',
        method: 'POST'
      },
      {
        body: {
          label: 'cypress',
          keyId: 'cypress2',
          secret: 'c-y-p-r-e-s-s',
          createdAt: '2021-11-21T01:11:12+01:00',
          lastUsed: '2021-11-21T01:11:12+01:00',
          validUntil: '2023-11-21'
        }
      }
    )
    cy.intercept(
      {
        url: '/mock-backend/api/private/tokens/cypress',
        method: 'DELETE'
      },
      {
        body: []
      }
    )
    cy.visit('/profile')
  })

  describe('access tokens', () => {
    it('list existing tokens', () => {
      cy.getById('access-token-label').contains('cypress-App')
    })

    it('delete token', () => {
      cy.getById('access-token-delete-button').click()
      cy.getById('access-token-modal-delete').as('deletion-modal')
      cy.get('@deletion-modal').should('be.visible').find('.modal-footer .btn-danger').click()
      cy.get('@deletion-modal').should('not.exist')
    })

    it('add token', () => {
      cy.getById('access-token-add-button').should('be.disabled')
      cy.getById('access-token-add-input-label').type('cypress')
      cy.getById('access-token-modal-add').should('not.exist')
      cy.getById('access-token-add-button').should('not.be.disabled').click()
      cy.getById('access-token-modal-add')
        .should('be.visible')
        .find('input[readonly]')
        .should('have.value', 'c-y-p-r-e-s-s')
    })
  })
})
