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

  describe('Cover Buttons', () => {
    beforeEach(() => {
      cy.logout()
    })

    it('Sign in Cover Button', () => {
      cy.get('.cover-button.btn-success')
        .click()
      cy.url()
        .should('include', '/login')
    })

    it('Features Cover Button', () => {
      cy.get('.cover-button.btn-primary')
        .click()
      cy.url()
        .should('include', '/features')
    })
  })

  it('History', () => {
    cy.get('#navLinkHistory')
      .click()
    cy.url()
      .should('include', '/history')
    cy.get('#navLinkIntro')
      .click()
    cy.url()
      .should('include', '/intro')
  })

  describe('Menu Buttons logged out', () => {
    beforeEach(() => {
      cy.logout()
    })

    it('New guest note', () => {
      cy.get('.d-inline-flex.btn-primary')
        .click()
      cy.url()
        .should('include', '/new')
    })

    it('Sign In', () => {
      cy.get('.btn-success.btn-sm')
        .click()
      cy.url()
        .should('include', '/login')
    })
  })

  describe('Menu Buttons logged in', () => {
    it('New note', () => {
      cy.get('.d-inline-flex.btn-primary')
        .click()
      cy.url()
        .should('include', '/new')
    })

    describe('User Menu', () => {
      beforeEach(() => {
        cy.get('#dropdown-user')
          .click()
      })

      it('Features', () => {
        cy.get('a.dropdown-item > i.fa-bolt')
          .click()
        cy.url()
          .should('include', '/features')
      })

      it('Features', () => {
        cy.get('a.dropdown-item > i.fa-user')
          .click()
        cy.url()
          .should('include', '/profile')
      })
    })
  })

  describe('Feature Links', () => {
    it('Share-Notes', () => {
      cy.get('i.fa-bolt.fa-3x')
        .click()
      cy.url()
        .should('include', '/features#Share-Notes')
    })

    it('KaTeX', () => {
      cy.get('i.fa-bar-chart.fa-3x')
        .click()
      cy.url()
        .should('include', '/features#MathJax')
    })

    it('Slide-Mode', () => {
      cy.get('i.fa-television.fa-3x')
        .click()
      cy.url()
        .should('include', '/features#Slide-Mode')
    })
  })

  describe('Powered By Links', () => {
    it('HedgeDoc', () => {
      cy.get('a[href="https://hedgedoc.org"]')
        .checkExternalLink('https://hedgedoc.org')
    })

    it('Releases', () => {
      cy.get('a[href*="/n/release-notes"]')
        .click()
      cy.url()
        .should('include', '/n/release-notes')
    })

    it('Privacy', () => {
      cy.get('a[href="https://example.com/privacy"]')
        .checkExternalLink('https://example.com/privacy')
    })

    it('TermsOfUse', () => {
      cy.get('a[href="https://example.com/termsOfUse"]')
        .checkExternalLink('https://example.com/termsOfUse')
    })

    it('Imprint', () => {
      cy.get('a[href="https://example.com/imprint"]')
        .checkExternalLink('https://example.com/imprint')
    })
  })

  describe('Follow us Links', () => {
    it('Github', () => {
      cy.get('a[href="https://github.com/hedgedoc/"]')
        .checkExternalLink('https://github.com/hedgedoc/')
    })

    it('Discourse', () => {
      cy.get('a[href="https://community.hedgedoc.org"]')
        .checkExternalLink('https://community.hedgedoc.org')
    })

    it('Matrix', () => {
      cy.get('a[href="https://matrix.to/#/#hedgedoc:matrix.org"]')
        .checkExternalLink('https://matrix.to/#/#hedgedoc:matrix.org')
    })

    it('Mastodon', () => {
      cy.get('a[href="https://social.hedgedoc.org"]')
        .checkExternalLink('https://social.hedgedoc.org')
    })

    it('POEditor', () => {
      cy.get('a[href="https://translate.hedgedoc.org"]')
        .checkExternalLink('https://translate.hedgedoc.org')
    })
  })
})
