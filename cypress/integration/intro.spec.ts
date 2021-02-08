/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
describe('Intro page', () => {
  beforeEach(() => {
    cy.intercept('/intro.md', 'test content')
    cy.visit('/')
  })

  describe('content', () => {
    it('fetches and shows the correct intro page content', () => {
      cy.getMarkdownBody()
        .contains('test content')
    })
  })

  describe('features button', () => {
    it('is hidden when logged in', () => {
      cy.get('[data-cy="features-button"]')
        .should('not.exist')
    })

    it('is visible when logged out', () => {
      cy.logout()
      cy.get('[data-cy="features-button"]')
        .should('exist')
    })
  })

  describe('sign in button', () => {
    it('is hidden when logged in', () => {
      cy.get('[data-cy="sign-in-button"]')
        .should('not.exist')
    })

    it('is visible when logged out', () => {
      cy.logout()
      cy.get('[data-cy="sign-in-button"]')
        .should('exist')
    })
  })

  describe('version dialog', () => {
    it('can be opened and closed', () => {
      cy.get('[data-cy="version-modal"]')
        .should('not.exist')
      cy.get('[data-cy="show-version-modal"]')
        .click()
      cy.get('[data-cy="version-modal"]')
        .should('be.visible')
      cy.get('[data-cy="version-modal"] [data-cy="close-version-modal-button"]')
        .contains('Close')
        .click()
      cy.get('[data-cy="version-modal"]')
        .should('not.exist')
    })
  })
})
