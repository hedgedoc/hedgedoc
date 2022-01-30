/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PAGE_MODE } from '../support/visit'

describe('Editor mode from URL parameter is used', () => {
  it('mode view', () => {
    cy.visitTestNote(PAGE_MODE.EDITOR, 'view')
    cy.getByCypressId('splitter-left').should('not.be.visible')
    cy.getByCypressId('splitter-right').should('be.visible')
  })
  it('mode both', () => {
    cy.visitTestNote(PAGE_MODE.EDITOR, 'both')
    cy.getByCypressId('splitter-left').should('be.visible')
    cy.getByCypressId('splitter-separator').should('exist')
    cy.getByCypressId('splitter-right').should('be.visible')
  })
  it('mode edit', () => {
    cy.visitTestNote(PAGE_MODE.EDITOR, 'edit')
    cy.getByCypressId('splitter-left').should('be.visible')
    cy.getByCypressId('splitter-right').should('not.be.visible')
  })
})
