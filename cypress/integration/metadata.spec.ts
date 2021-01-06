/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('yaml-metadata: tags', () => {
  beforeEach(() => {
    cy.visit('/n/features')
    cy.get('.CodeMirror textarea')
    .type('{ctrl}a', { force: true })
    .type('{backspace}')
  })

  it('show deprecation notice on old syntax', () => {
    cy.get('.CodeMirror textarea')
      .type('---\ntags: a, b, c\n---')
    cy.get('.splitter.right .w-100.h-100 .alert.alert-warning')
      .should('be.visible')
  })

  it('show no deprecation notice on yaml-array (1)', () => {
    cy.get('.CodeMirror textarea')
    .type('---\ntags: [\'a\', \'b\', \'c\']\n---')
    cy.get('.splitter.right .w-100.h-100 .alert.alert-warning')
    .should('not.exist')
  })

  it('show no deprecation notice on yaml-array (2)', () => {
    cy.get('.CodeMirror textarea')
    .type('---\ntags:\n  - a\nb\nc\n')
    .type('{backspace}{backspace}{backspace}{backspace}')
    .type('---')
    cy.get('.splitter.right .w-100.h-100 .alert.alert-warning')
    .should('not.exist')
  })
})
