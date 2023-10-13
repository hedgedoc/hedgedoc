/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const MOTD_LOCAL_STORAGE_KEY = 'motd.lastModified'
const motdMockHtml = 'This is the test motd text'

describe('Motd', () => {
  it("shows, dismisses and won't show again a motd modal", () => {
    localStorage.removeItem(MOTD_LOCAL_STORAGE_KEY)

    cy.visitHistory()
    cy.getSimpleRendererBody().should('contain.text', motdMockHtml)
    cy.getByCypressId('motd-dismiss')
      .click()
      .then(() => {
        expect(localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)).not.to.be.eq(null)
      })
    cy.getByCypressId('motd-modal').should('not.exist')
    cy.reload()
    cy.get('main').should('exist')
    cy.getByCypressId('motd-modal').should('not.exist')
  })
})
