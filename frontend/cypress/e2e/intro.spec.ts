/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
describe('Intro page', () => {
  beforeEach(() => {
    cy.intercept('/public/intro.md', 'test content')
    cy.visitHome()
  })

  describe('customizable content', () => {
    it('fetches and shows the correct intro page content', () => {
      cy.getSimpleRendererBody().contains('test content')
    })

    it("won't show anything if no content was found", () => {
      cy.intercept('/public/intro.md', {
        statusCode: 404
      })
      cy.visitHome()

      cy.getByCypressId('documentIframe').should('not.exist')
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
})
