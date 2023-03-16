/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
describe('Intro page', () => {
  beforeEach(() => {
    cy.intercept('public/intro.md', 'test content')
    cy.visitHome()
  })

  describe('customizable content', () => {
    it('fetches and shows the correct intro page content', () => {
      cy.getSimpleRendererBody().contains('test content')
    })

    it("won't show anything if no content was found", () => {
      cy.intercept('public/intro.md', {
        statusCode: 404
      })
      cy.visitHome()

      cy.getByCypressId('documentIframe').should('not.exist')
    })
  })

  describe('features button', () => {
    it('is hidden when logged in', () => {
      cy.getByCypressId('features-button').should('not.exist')
    })

    it('is visible when logged out', () => {
      cy.logout()
      cy.getByCypressId('features-button').should('exist')
    })
  })

  describe('sign in button', () => {
    it('is hidden when logged in', () => {
      cy.getByCypressId('sign-in-button').should('not.exist')
    })

    it('is visible when logged out', () => {
      cy.logout()
      cy.getByCypressId('sign-in-button').should('exist')
    })
  })

  describe('version dialog', () => {
    it('can be opened and closed', () => {
      cy.getByCypressId('version-modal').should('not.exist')
      cy.getByCypressId('show-version-modal').click()
      cy.getByCypressId('version-modal').should('be.visible')
      cy.getByCypressId('version-modal').find('.modal-header .btn-close').click()
      cy.getByCypressId('version-modal').should('not.exist')
    })
  })
})
