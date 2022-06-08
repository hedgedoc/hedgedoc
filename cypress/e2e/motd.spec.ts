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
  const mockExistingMotd = (useEtag?: boolean, content = motdMockContent) => {
    cy.intercept('GET', '/mock-public/motd.md', {
      statusCode: 200,
      headers: { [useEtag ? 'etag' : 'Last-Modified']: MOCK_LAST_MODIFIED },
      body: content
    })

    cy.intercept('HEAD', '/mock-public/motd.md', {
      statusCode: 200,
      headers: { [useEtag ? 'etag' : 'Last-Modified']: MOCK_LAST_MODIFIED }
    })
  }

  beforeEach(() => {
    localStorage.removeItem(MOTD_LOCAL_STORAGE_KEY)
  })

  it('shows the correct alert Motd text', () => {
    mockExistingMotd()
    cy.visitHome()
    cy.getByCypressId('motd').find('.markdown-body').should('contain.html', motdMockHtml)
  })

  it("doesn't allow html in the motd", () => {
    mockExistingMotd(false, '<iframe></iframe>')
    cy.visitHome()
    cy.getByCypressId('motd').find('.markdown-body').should('have.html', '<p>&lt;iframe&gt;&lt;/iframe&gt;</p>\n')
  })

  it('can be dismissed using etag', () => {
    mockExistingMotd(true)
    cy.visitHome()
    cy.getByCypressId('motd').find('.markdown-body').should('contain.html', motdMockHtml)
    cy.getByCypressId('motd-dismiss')
      .click()
      .then(() => {
        expect(localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)).to.equal(MOCK_LAST_MODIFIED)
      })
    cy.getByCypressId('motd').should('not.exist')
  })

  it('can be dismissed', () => {
    mockExistingMotd()
    cy.visitHome()
    cy.getByCypressId('motd').find('.markdown-body').should('contain.html', motdMockHtml)
    cy.getByCypressId('motd-dismiss')
      .click()
      .then(() => {
        expect(localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)).to.equal(MOCK_LAST_MODIFIED)
      })
    cy.getByCypressId('motd').should('not.exist')
  })

  it("won't show again after dismiss and reload", () => {
    mockExistingMotd()
    cy.visitHome()
    cy.getByCypressId('motd').find('.markdown-body').should('contain.html', motdMockHtml)
    cy.getByCypressId('motd-dismiss')
      .click()
      .then(() => {
        expect(localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)).to.equal(MOCK_LAST_MODIFIED)
      })
    cy.getByCypressId('motd').should('not.exist')
    cy.reload()
    cy.get('main').should('exist')
    cy.getByCypressId('motd').should('not.exist')
  })

  it('will show again after reload without dismiss', () => {
    mockExistingMotd()
    cy.visitHome()
    cy.getByCypressId('motd').find('.markdown-body').should('contain.html', motdMockHtml)
    cy.reload()
    cy.get('main').should('exist')
    cy.getByCypressId('motd').find('.markdown-body').should('contain.html', motdMockHtml)
  })

  it("won't show again after dismiss and page navigation", () => {
    mockExistingMotd()
    cy.visitHome()
    cy.getByCypressId('motd').find('.markdown-body').should('contain.html', motdMockHtml)
    cy.getByCypressId('motd-dismiss')
      .click()
      .then(() => {
        expect(localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)).to.equal(MOCK_LAST_MODIFIED)
      })
    cy.getByCypressId('motd').should('not.exist')
    cy.getByCypressId('navLinkHistory').click()
    cy.get('main').should('exist')
    cy.getByCypressId('motd').should('not.exist')
  })

  it("won't show if no file exists", () => {
    cy.visitHome()
    cy.get('main').should('exist')
    cy.getByCypressId('motd').should('not.exist')
  })
})
