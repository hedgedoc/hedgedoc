/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { branding } from '../support/config'

const title = 'This is a test title'
describe('Document Title', () => {
  beforeEach(() => {
    cy.visit('/n/test')
    cy.get('.btn.active.btn-outline-secondary > i.fa-columns')
      .should('exist')

    cy.get('.CodeMirror')
      .click()
      .get('textarea')
      .as('codeinput')
  })

  describe('title should be yaml metadata title', () => {
    it('just yaml metadata title', () => {
      cy.get('@codeinput')
        .fill(`---\ntitle: ${title}\n---`)
      cy.title()
        .should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('yaml metadata title and opengraph title', () => {
      cy.get('@codeinput')
        .fill(`---\ntitle: ${title}\nopengraph:\n  title: False title\n---`)
      cy.title()
        .should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('yaml metadata title, opengraph title and first heading', () => {
      cy.get('@codeinput')
        .fill(`---\ntitle: ${title}\nopengraph:\n  title: False title\n---\n# a first title`)
      cy.title()
        .should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })
  })

  describe('title should be opengraph title', () => {
    it('just opengraph title', () => {
      cy.get('@codeinput')
        .fill(`---\nopengraph:\n  title: ${title}\n---`)
      cy.title()
        .should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('opengraph title and first heading', () => {
      cy.get('@codeinput')
        .fill(`---\nopengraph:\n  title: ${title}\n---\n# a first title`)
      cy.title()
        .should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })
  })

  describe('title should be first heading', () => {
    it('just first heading', () => {
      cy.get('@codeinput')
        .fill(`# ${title}`)
      cy.title()
        .should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('just first heading with alt-text instead of image', () => {
      cy.get('@codeinput')
        .fill(`# ${title} ![abc](https://dummyimage.com/48)`)
      cy.title()
        .should('eq', `${title} abc - HedgeDoc @ ${branding.name}`)
    })

    it('just first heading without link syntax', () => {
      cy.get('@codeinput')
        .fill(`# ${title} [link](https://hedgedoc.org)`)
      cy.title()
        .should('eq', `${title} link - HedgeDoc @ ${branding.name}`)
    })

    it('markdown syntax removed first', () => {
      cy.get('@codeinput')
        .fill(`# ${title} 1*2*3 4*5**`)
      cy.title()
        .should('eq', `${title} 123 4*5** - HedgeDoc @ ${branding.name}`)
    })

    it('markdown syntax removed second', () => {
      cy.get('@codeinput')
        .fill(`# ${title} **1 2*`)
      cy.title()
        .should('eq', `${title} *1 2 - HedgeDoc @ ${branding.name}`)
    })

    it('markdown syntax removed third', () => {
      cy.get('a')
        .get('@codeinput')
        .fill(`# ${title} _asd_`)
      cy.title()
        .should('eq', `${title} asd - HedgeDoc @ ${branding.name}`)
    })
  })
})
