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
    cy.getByCypressId('view-mode-both').click()
    cy.getByCypressId('splitter-left').should('be.visible')
    cy.getByCypressId('splitter-right').should('be.visible')
  })

  it('can show only preview pane', () => {
    cy.getByCypressId('view-mode-preview').click()
    cy.getByCypressId('splitter-left').should('be.not.visible')
    cy.getByCypressId('splitter-right').should('be.visible')
  })

  it('can show only editor pane', () => {
    cy.getByCypressId('view-mode-editor').click()
    cy.getByCypressId('splitter-left').should('be.visible')
    cy.getByCypressId('splitter-right').should('be.not.visible')
  })

  it('can change the split by dragging', () => {
    cy.getByCypressId('splitter-left').then((leftPanebefore) => {
      const widthBefore = leftPanebefore.outerWidth()

      cy.getByCypressId('view-mode-both').click()
      cy.getByCypressId('split-divider').should('be.visible').trigger('mousedown', { buttons: 1 })
      cy.document().trigger('mousemove', { buttons: 1, pageX: 0, pageY: 0 })
      cy.getByCypressId('split-divider').trigger('mouseup')

      cy.getByCypressId('splitter-left').should('not.eq', widthBefore)
    })
  })
})
