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
      cy.getIntroBody().contains('test content')
    })

    it("won't show anything if no content was found", () => {
      cy.intercept('/mock-backend/public/intro.md', {
        statusCode: 404
      })
      cy.visit('/')

      cy.getById('documentIframe').should('not.exist')
    })
  })

  describe('features button', () => {
    it('is hidden when logged in', () => {
      cy.getById('features-button').should('not.exist')
    })

    it('is visible when logged out', () => {
      cy.logout()
      cy.getById('features-button').should('exist')
    })
  })

  describe('sign in button', () => {
    it('is hidden when logged in', () => {
      cy.getById('sign-in-button').should('not.exist')
    })

    it('is visible when logged out', () => {
      cy.logout()
      cy.getById('sign-in-button').should('exist')
    })
  })

  describe('version dialog', () => {
    it('can be opened and closed', () => {
      cy.getById('version-modal').should('not.exist')
      cy.getById('show-version-modal').click()
      cy.getById('version-modal').should('be.visible')
      cy.getById('version-modal').find('.modal-header .close').click()
      cy.getById('version-modal').should('not.exist')
    })
  })
})
