/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Test word count with', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  it('empty note', () => {
    cy.setCodemirrorContent('')
    cy.wait(500)
    cy.getById('sidebar-btn-document-info').click()
    cy.getById('document-info-modal').should('be.visible')
    cy.getById('document-info-word-count').should('have.text', '0')
  })

  it('simple words', () => {
    cy.setCodemirrorContent('five words should be enough')
    cy.wait(500)
    cy.getById('sidebar-btn-document-info').click()
    cy.getById('document-info-modal').should('be.visible')
    cy.getById('document-info-word-count').should('have.text', '5')
  })

  it('excluded codeblocks', () => {
    cy.setCodemirrorContent('```\nthis is should be ignored\n```\n\ntwo `words`')
    cy.wait(500)
    cy.getById('sidebar-btn-document-info').click()
    cy.getById('document-info-modal').should('be.visible')
    cy.getById('document-info-word-count').should('have.text', '2')
  })

  it('excluded images', () => {
    cy.setCodemirrorContent('![ignored alt text](https://dummyimage.com/48) not ignored text')
    cy.wait(500)
    cy.getById('sidebar-btn-document-info').click()
    cy.getById('document-info-modal').should('be.visible')
    cy.getById('document-info-word-count').should('have.text', '3')
  })
})
