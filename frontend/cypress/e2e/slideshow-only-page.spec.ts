/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PAGE_MODE } from '../support/visit'

describe('Slideshow only page', () => {
  it('renders slide show mode', () => {
    cy.visitTestNote(PAGE_MODE.PRESENTATION)
    cy.getReveal().should('exist')
  })
})
