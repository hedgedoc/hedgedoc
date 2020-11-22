/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { banner } from '../support/config'

describe('Banner', () => {
  beforeEach(() => {
    cy.visit('/')
    expect(localStorage.getItem('bannerTimeStamp')).to.be.null
  })

  it('shows the correct alert banner text', () => {
    cy.get('.alert-primary.show')
      .contains(banner.text)
  })

  it('can be dismissed', () => {
    cy.get('.alert-primary.show')
      .contains(banner.text)
    cy.get('.alert-primary.show')
      .find('.fa-times')
      .click()
      .then(() => {
        expect(localStorage.getItem('bannerTimeStamp')).to.equal(banner.timestamp)
      })
    cy.get('.alert-primary.show')
      .should('not.exist')
  })
})
