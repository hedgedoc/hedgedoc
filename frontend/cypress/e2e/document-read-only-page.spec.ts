/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PAGE_MODE } from '../support/visit'

describe('Document read only page', () => {
  it('renders the document mode', () => {
    cy.visitTestNote(PAGE_MODE.DOCUMENT_READ_ONLY)
    cy.getMarkdownBody().should('exist')
  })
})
