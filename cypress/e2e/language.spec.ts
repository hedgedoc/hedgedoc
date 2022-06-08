/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { languages } from '../fixtures/languages'

describe('Languages', () => {
  beforeEach(() => {
    cy.visitHome()
  })

  it('all languages are available', () => {
    cy.getByCypressId('language-picker').find('option').as('languages')
    cy.get('@languages').should('have.length', 28)
    languages.forEach((language) => {
      cy.get('@languages').contains(language)
    })
  })

  it('language changes affect the UI', () => {
    cy.getByCypressId('language-picker').select('English')
    cy.getByCypressId('new-note-button').find('span').contains('New note')
    cy.getByCypressId('language-picker').select('Deutsch')
    cy.getByCypressId('new-note-button').find('span').contains('Neue Notiz')
  })
})
