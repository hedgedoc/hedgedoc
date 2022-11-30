/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { testNoteId } from './visit-test-editor'

declare namespace Cypress {
  interface Chainable {
    visitTestNote(pageMode?: PAGE_MODE, query?: string): Chainable<Cypress.AUTWindow>

    visitHome(): Chainable<Cypress.AUTWindow>

    visitHistory(): Chainable<Cypress.AUTWindow>
  }
}

Cypress.Commands.add('visitHome', () => {
  return cy.visit('/', { retryOnNetworkFailure: true, retryOnStatusCodeFailure: true })
})

Cypress.Commands.add('visitHistory', () => {
  return cy.visit(`/history`, { retryOnNetworkFailure: true, retryOnStatusCodeFailure: true })
})

export enum PAGE_MODE {
  EDITOR = 'n',
  PRESENTATION = 'p',
  DOCUMENT_READ_ONLY = 's'
}

Cypress.Commands.add('visitTestNote', (pageMode: PAGE_MODE = PAGE_MODE.EDITOR, query?: string) => {
  return cy.visit(`/${pageMode}/${testNoteId}${query ? `?${query}` : ''}`, {
    retryOnNetworkFailure: true,
    retryOnStatusCodeFailure: true
  })
})
