/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('profile page', () => {
  beforeEach(() => {
    cy.intercept(
      {
        url: '/api/private/tokens',
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
        url: '/api/private/tokens',
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
        },
        statusCode: 201
      }
    )
    cy.intercept(
      {
        url: '/api/private/tokens/cypress',
        method: 'DELETE'
      },
      {
        body: [],
        statusCode: 204
      }
    )
    cy.visit('/profile', { retryOnNetworkFailure: true })
  })

  describe('access tokens', () => {
    it('list existing tokens', () => {
      cy.getByCypressId('access-token-label').contains('cypress-App')
    })

    it('delete token', () => {
      cy.getByCypressId('access-token-delete-button').click()
      cy.getByCypressId('access-token-modal-delete').as('deletion-modal')
      cy.get('@deletion-modal').should('be.visible').find('.modal-footer .btn-danger').click()
      cy.get('@deletion-modal').should('not.exist')
    })

    it('add token', () => {
      cy.getByCypressId('access-token-add-button').should('be.disabled')
      cy.getByCypressId('access-token-add-input-label').type('cypress')
      cy.getByCypressId('access-token-modal-add').should('not.exist')
      cy.getByCypressId('access-token-add-button').should('not.be.disabled').click()
      cy.getByCypressId('access-token-modal-add')
        .should('be.visible')
        .find('input[readonly]')
        .should('have.value', 'c-y-p-r-e-s-s')
    })
  })
})
