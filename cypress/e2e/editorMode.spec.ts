/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PAGE_MODE } from '../support/visit'

describe('Editor mode from URL parameter is used', () => {
  it('mode view', () => {
    cy.visitTestNote(PAGE_MODE.EDITOR, 'view')
    cy.getByCypressId('editor-pane').should('not.be.visible')
    cy.getByCypressId('documentIframe').should('be.visible')
  })
  it('mode both', () => {
    cy.visitTestNote(PAGE_MODE.EDITOR, 'both')
    cy.getByCypressId('editor-pane').should('be.visible')
    cy.getByCypressId('documentIframe').should('be.visible')
  })
  it('mode edit', () => {
    cy.visitTestNote(PAGE_MODE.EDITOR, 'edit')
    cy.getByCypressId('editor-pane').should('be.visible')
    cy.getByCypressId('documentIframe').should('not.be.visible')
  })
})
