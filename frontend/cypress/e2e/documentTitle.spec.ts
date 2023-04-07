/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { branding } from '../support/config'

const title = 'This is a test title'
describe('Document Title', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  describe('title should be yaml metadata title', () => {
    it('just yaml metadata title', () => {
      cy.setCodemirrorContent(`---\ntitle: ${title}\n---`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('yaml metadata title and opengraph title', () => {
      cy.setCodemirrorContent(`---\ntitle: ${title}\nopengraph:\n  title: False title\n---`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('yaml metadata title, opengraph title and first heading', () => {
      cy.setCodemirrorContent(`---\ntitle: ${title}\nopengraph:\n  title: False title\n---\n# a first title`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })
  })

  describe('title should be opengraph title', () => {
    it('just opengraph title', () => {
      cy.setCodemirrorContent(`---\nopengraph:\n  title: ${title}\n---`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('opengraph title and first heading', () => {
      cy.setCodemirrorContent(`---\nopengraph:\n  title: ${title}\n---\n# a first title`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })
  })

  describe('title should be first heading', () => {
    it('just first heading', () => {
      cy.setCodemirrorContent(`# ${title}`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('just first heading with alt-text instead of image', () => {
      cy.setCodemirrorContent(`# ${title} ![abc](https://dummyimage.com/48)`)
      cy.title().should('eq', `${title} abc - HedgeDoc @ ${branding.name}`)
    })

    it('just first heading without link syntax', () => {
      cy.setCodemirrorContent(`# ${title} [link](https://hedgedoc.org)`)
      cy.title().should('eq', `${title} link - HedgeDoc @ ${branding.name}`)
    })

    it('markdown syntax removed first', () => {
      cy.setCodemirrorContent(`# ${title} 1*2*3 4*5**`)
      cy.title().should('eq', `${title} 123 4*5** - HedgeDoc @ ${branding.name}`)
    })

    it('markdown syntax removed second', () => {
      cy.setCodemirrorContent(`# ${title} **1 2*`)
      cy.title().should('eq', `${title} *1 2 - HedgeDoc @ ${branding.name}`)
    })

    it('markdown syntax removed third', () => {
      cy.setCodemirrorContent(`# ${title} _asd_`)
      cy.title().should('eq', `${title} asd - HedgeDoc @ ${branding.name}`)
    })

    it('katex code looks right', () => {
      cy.setCodemirrorContent(`# $\\alpha$-foo`)
      cy.getIframeBody().find('h1').should('contain', 'α')
      cy.title().should('eq', `\\alpha-foo - HedgeDoc @ ${branding.name}`)
    })
  })
})
