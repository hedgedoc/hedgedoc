/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../support/index'

describe('Links Intro', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('History', () => {
    cy.getByCypressId('navLinkHistory').click()
    cy.url().should('include', '/history')
    cy.getByCypressId('navLinkIntro').click()
    cy.url().should('include', '/intro')
  })

  describe('Menu Buttons logged out', () => {
    beforeEach(() => {
      cy.logout()
    })

    it('New guest note', () => {
      cy.getByCypressId('new-guest-note-button').click()
      cy.url().should('include', '/new')
    })
  })

  describe('Menu Buttons logged in', () => {
    it('New note', () => {
      cy.getByCypressId('new-note-button').click()
      cy.url().should('include', '/new')
    })

    describe('User Menu', () => {
      beforeEach(() => {
        cy.getByCypressId('user-dropdown').click()
      })

      it('Features', () => {
        cy.getByCypressId('user-dropdown-features-button').click()
        cy.url().should('include', '/features')
      })

      it('Profile', () => {
        cy.getByCypressId('user-dropdown-profile-button').click()
        cy.url().should('include', '/profile')
      })
    })
  })
})
