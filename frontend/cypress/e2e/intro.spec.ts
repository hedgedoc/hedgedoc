/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
describe('Intro page', () => {
  beforeEach(() => {
    cy.intercept('/public/intro.md', 'test content')
    cy.logOut()
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
})
