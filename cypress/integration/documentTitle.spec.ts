import { branding } from '../support/config'

const title = 'This is a test title'
describe('Document Title', () => {
  beforeEach(() => {
    cy.visit('/n/test')
    cy.get('.btn.active.btn-outline-secondary > i.fa-columns')
      .should('exist')
    cy.get('.CodeMirror textarea')
      .type('{ctrl}a', { force: true })
      .type('{backspace}')
  })

  describe('title should be yaml metadata title', () => {
    it('just yaml metadata title', () => {
      cy.get('.CodeMirror textarea')
        .type(`---\ntitle: ${title}\n---`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('yaml metadata title and opengraph title', () => {
      cy.get('.CodeMirror textarea')
        .type(`---\ntitle: ${title}\nopengraph:\n  title: False title\n{backspace}{backspace}---`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('yaml metadata title, opengraph title and first heading', () => {
      cy.get('.CodeMirror textarea')
        .type(`---\ntitle: ${title}\nopengraph:\n  title: False title\n{backspace}{backspace}---\n# a first title`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })
  })

  describe('title should be opengraph title', () => {
    it('just opengraph title', () => {
      cy.get('.CodeMirror textarea')
        .type(`---\nopengraph:\n  title: ${title}\n{backspace}{backspace}---`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('opengraph title and first heading', () => {
      cy.get('.CodeMirror textarea')
        .type(`---\nopengraph:\n  title: ${title}\n{backspace}{backspace}---\n# a first title`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })
  })

  describe('title should be first heading', () => {
    it('just first heading', () => {
      cy.get('.CodeMirror textarea')
        .type(`# ${title}`)
      cy.title().should('eq', `${title} - HedgeDoc @ ${branding.name}`)
    })

    it('just first heading with alt-text instead of image', () => {
      cy.get('.CodeMirror textarea')
        .type(`# ${title} ![abc](https://dummyimage.com/48)`)
      cy.title().should('eq', `${title} abc - HedgeDoc @ ${branding.name}`)
    })

    it('just first heading without link syntax', () => {
      cy.get('.CodeMirror textarea')
        .type(`# ${title} [link](https://codimd.org)`)
      cy.title().should('eq', `${title} link - HedgeDoc @ ${branding.name}`)
    })
  })
})
