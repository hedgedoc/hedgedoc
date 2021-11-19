/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { languages } from '../fixtures/languages'

describe('Languages', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('all languages are available', () => {
    cy.getById('language-picker').find('option').as('languages')
    cy.get('@languages').should('have.length', 28)
    languages.forEach((language) => {
      cy.get('@languages').contains(language)
    })
  })

  it('language changes affect the UI', () => {
    cy.getById('language-picker').select('English')
    cy.getById('new-note-button').find('span').contains('New note')
    cy.getById('language-picker').select('Deutsch')
    cy.getById('new-note-button').find('span').contains('Neue Notiz')
  })
})
