/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Test word count with', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  it('empty note', () => {
    cy.setCodemirrorContent('')
    cy.getByCypressId('sidebar-menu-info').click()
    cy.getByCypressId('document-info-word-count').should('be.visible')
    cy.getByCypressId('document-info-word-count').contains('0')
  })

  it('simple words', () => {
    cy.setCodemirrorContent('five words should be enough')
    cy.getMarkdownBody().contains('five words should be enough')
    cy.getByCypressId('sidebar-menu-info').click()
    cy.getByCypressId('document-info-word-count').should('be.visible')
    cy.getByCypressId('document-info-word-count').contains('5')
  })

  it('excluded codeblocks', () => {
    cy.setCodemirrorContent('```\nthis is should be ignored\n```\n\ntwo `words`')
    cy.getMarkdownBody().contains('two words')
    cy.getByCypressId('sidebar-menu-info').click()
    cy.getByCypressId('document-info-word-count').should('be.visible')
    cy.getByCypressId('document-info-word-count').contains('2')
  })

  it('excluded images', () => {
    cy.setCodemirrorContent('![ignored alt text](https://dummyimage.com/48) not ignored text')
    cy.getMarkdownBody().contains('not ignored text')
    cy.getByCypressId('sidebar-menu-info').click()
    cy.getByCypressId('document-info-word-count').should('be.visible')
    cy.getByCypressId('document-info-word-count').contains('3')
  })
})
