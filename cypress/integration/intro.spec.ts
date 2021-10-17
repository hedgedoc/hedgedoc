/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
describe('Intro page', () => {
  beforeEach(() => {
    cy.intercept('/mock-backend/public/intro.md', 'test content')
    cy.visit('/')
  })

  describe('customizable content', () => {
    it('fetches and shows the correct intro page content', () => {
      cy.getMarkdownBody()
        .contains('test content')
    })

    it('won\'t show anything if no content was found', () => {
      cy.intercept('/mock-backend/public/intro.md', {
        statusCode: 404
      })

      cy.get(`iframe[data-cypress-id="documentIframe"]`)
        .should('not.exist')
    })
  })

  describe('features button', () => {
    it('is hidden when logged in', () => {
      cy.get('[data-cypress-id="features-button"]')
        .should('not.exist')
    })

    it('is visible when logged out', () => {
      cy.logout()
      cy.get('[data-cypress-id="features-button"]')
        .should('exist')
    })
  })

  describe('sign in button', () => {
    it('is hidden when logged in', () => {
      cy.get('[data-cypress-id="sign-in-button"]')
        .should('not.exist')
    })

    it('is visible when logged out', () => {
      cy.logout()
      cy.get('[data-cypress-id="sign-in-button"]')
        .should('exist')
    })
  })

  describe('version dialog', () => {
    it('can be opened and closed', () => {
      cy.get('[data-cypress-id="version-modal"]')
        .should('not.exist')
      cy.get('[data-cypress-id="show-version-modal"]')
        .click()
      cy.get('[data-cypress-id="version-modal"]')
        .should('be.visible')
      cy.get('[data-cypress-id="version-modal"] .modal-header .close')
        .click()
      cy.get('[data-cypress-id="version-modal"]')
        .should('not.exist')
    })
  })
})
