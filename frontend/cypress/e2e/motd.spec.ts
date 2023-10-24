/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MOTD_LOCAL_STORAGE_KEY } from '../../src/components/global-dialogs/motd-modal/local-storage-keys'

const motdMockHtml = 'This is the test motd text'

describe('Motd', () => {
  it("shows, dismisses and won't show again a motd modal", () => {
    window.localStorage.removeItem(MOTD_LOCAL_STORAGE_KEY)

    cy.visitHistory()
    cy.getSimpleRendererBody().should('contain.text', motdMockHtml)
    cy.getByCypressId('motd-dismiss')
      .click()
      .then(() => {
        expect(window.localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)).not.to.be.eq(null)
      })
    cy.getByCypressId('motd-modal').should('not.exist')
    cy.reload()
    cy.get('main').should('exist')
    cy.getByCypressId('motd-modal').should('not.exist')
  })
})
