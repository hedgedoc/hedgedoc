/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Link gets replaced with embedding: ', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  // TODO Add general testing of one-click-embedding component. The tests below just test a specific use of the component.

  it('GitHub Gist', () => {
    cy.setCodemirrorContent('https://gist.github.com/schacon/1')
    cy.getMarkdownBody().findByCypressId('click-shield-gist').find('.preview-background').parent().click()
    cy.getMarkdownBody().findByCypressId('gh-gist').should('be.visible')
  })
})
