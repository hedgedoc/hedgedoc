/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Split view', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  it('can show both panes', () => {
    cy.get('[data-cypress-id="view-mode-both"]').click()
    cy.get('.splitter.left').should('be.visible')
    cy.get('.splitter.right').should('be.visible')
  })

  it('can show only preview pane', () => {
    cy.get('[data-cypress-id="view-mode-preview"]').click()
    cy.get('.splitter.left').should('be.not.visible')
    cy.get('.splitter.right').should('be.visible')
  })

  it('can show only editor pane', () => {
    cy.get('[data-cypress-id="view-mode-editor"]').click()
    cy.get('.splitter.left').should('be.visible')
    cy.get('.splitter.right').should('be.not.visible')
  })

  it('can change the split by dragging', () => {
    cy.get('.splitter.left').then((leftPanebefore) => {
      const widthBefore = leftPanebefore.outerWidth()

      cy.get('[data-cypress-id="view-mode-both"]').click()
      cy.get('.split-divider').should('be.visible').trigger('mousedown', { buttons: 1 })
      cy.document().trigger('mousemove', { buttons: 1, pageX: 0, pageY: 0 })
      cy.get('.split-divider').trigger('mouseup')

      cy.get('.splitter.left').should('not.eq', widthBefore)
    })
  })
})
