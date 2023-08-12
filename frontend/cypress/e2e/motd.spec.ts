/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const MOTD_LOCAL_STORAGE_KEY = 'motd.lastModified'
const MOCK_LAST_MODIFIED = 'mockETag'
const motdMockContent = 'This is the **mock** Motd call'
const motdMockHtml = 'This is the <strong>mock</strong> Motd call'

describe('Motd', () => {
  it("shows, dismisses and won't show again a motd modal", () => {
    localStorage.removeItem(MOTD_LOCAL_STORAGE_KEY)
    cy.intercept('GET', '/public/motd.md', {
      statusCode: 200,
      headers: { 'Last-Modified': MOCK_LAST_MODIFIED },
      body: motdMockContent
    })

    cy.intercept('HEAD', '/public/motd.md', {
      statusCode: 200,
      headers: { 'Last-Modified': MOCK_LAST_MODIFIED }
    })
    cy.visitHistory()
    cy.getSimpleRendererBody().should('contain.html', motdMockHtml)
    cy.getByCypressId('motd-dismiss')
      .click()
      .then(() => {
        expect(localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)).to.equal(MOCK_LAST_MODIFIED)
      })
    cy.getByCypressId('motd-modal').should('not.exist')
    cy.reload()
    cy.get('main').should('exist')
    cy.getByCypressId('motd-modal').should('not.exist')
  })
})
