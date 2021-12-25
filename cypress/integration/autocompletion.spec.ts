/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Autocompletion works for', () => {
  beforeEach(() => {
    cy.visitTestEditor()
    cy.get('.CodeMirror').click().get('textarea').as('codeinput')
  })

  describe('code block', () => {
    it('via enter', () => {
      cy.setCodemirrorContent('```')
      cy.get('.CodeMirror-hints').should('exist')
      cy.get('@codeinput').type('{enter}')
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line').contains('```abnf')
      cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line').contains('```')
      cy.getMarkdownBody().findByCypressId('highlighted-code-block').should('exist')
    })
    it('via doubleclick', () => {
      cy.setCodemirrorContent('```')
      cy.get('.CodeMirror-hints > li').first().dblclick()
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line').contains('```abnf')
      cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line').contains('```')
      cy.getMarkdownBody().findByCypressId('highlighted-code-block').should('exist')
    })
  })

  describe('container', () => {
    it('via enter', () => {
      cy.setCodemirrorContent(':::')
      cy.get('.CodeMirror-hints').should('exist')
      cy.get('@codeinput').type('{enter}')
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line').contains(':::success')
      cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line').contains('::: ')
      cy.getMarkdownBody().find('.alert').should('exist')
    })
    it('via doubleclick', () => {
      cy.setCodemirrorContent(':::')
      cy.get('.CodeMirror-hints > li').first().dblclick()
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line').contains(':::success')
      cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line').contains('::: ')
      cy.getMarkdownBody().find('.alert').should('exist')
    })
  })

  describe('emoji', () => {
    describe('normal emoji', () => {
      it('via enter', () => {
        cy.setCodemirrorContent(':hedg')
        cy.get('.CodeMirror-hints').should('exist')
        cy.get('@codeinput').type('{enter}')
        cy.get('.CodeMirror-hints').should('not.exist')
        cy.get('.CodeMirror-activeline').contains(':hedgehog:')
      })
      it('via doubleclick', () => {
        cy.setCodemirrorContent(':hedg')
        cy.get('.CodeMirror-hints > li').first().dblclick()
        cy.get('.CodeMirror-hints').should('not.exist')
        cy.get('.CodeMirror-activeline').contains(':hedgehog:')
      })
    })

    describe('fork-awesome-icon', () => {
      it('via enter', () => {
        cy.setCodemirrorContent(':fa-face')
        cy.get('.CodeMirror-hints').should('exist')
        cy.get('@codeinput').type('{enter}')
        cy.get('.CodeMirror-hints').should('not.exist')
        cy.get('.CodeMirror-activeline').contains(':fa-facebook:')
      })
      it('via doubleclick', () => {
        cy.setCodemirrorContent(':fa-face')
        cy.get('.CodeMirror-hints > li').first().dblclick()
        cy.get('.CodeMirror-hints').should('not.exist')
        cy.get('.CodeMirror-activeline').contains(':fa-facebook:')
      })
    })
  })

  describe('header', () => {
    it('via enter', () => {
      cy.setCodemirrorContent('#')
      cy.get('.CodeMirror-hints').should('exist')
      cy.get('@codeinput').type('{enter}')
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('# ')
      cy.getMarkdownBody().find('h1').should('have.text', '\n ')
    })
    it('via doubleclick', () => {
      cy.setCodemirrorContent('#')
      cy.get('.CodeMirror-hints > li').first().dblclick()
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('# ')
      cy.getMarkdownBody().find('h1').should('have.text', '\n ')
    })
  })

  describe('images', () => {
    it('via enter', () => {
      cy.setCodemirrorContent('!')
      cy.get('.CodeMirror-hints').should('exist')
      cy.get('@codeinput').type('{enter}')
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('![image alt](https:// "title")')
      cy.getMarkdownBody().findByCypressId('image-placeholder-image-drop').should('exist')
    })
    it('via doubleclick', () => {
      cy.setCodemirrorContent('!')
      cy.get('.CodeMirror-hints > li').first().dblclick()
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('![image alt](https:// "title")')
      cy.getMarkdownBody().findByCypressId('image-placeholder-image-drop').should('exist')
    })
  })

  describe('links', () => {
    it('via enter', () => {
      cy.setCodemirrorContent('[')
      cy.get('.CodeMirror-hints').should('exist')
      cy.get('@codeinput').type('{enter}')
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('[link text](https:// "title") ')
      cy.getMarkdownBody()
        .find('p > a')
        .should('have.text', 'link text')
        .should('have.attr', 'href', 'https://')
        .should('have.attr', 'title', 'title')
    })
    it('via doubleclick', () => {
      cy.setCodemirrorContent('[')
      cy.get('.CodeMirror-hints > li').first().dblclick()
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('[link text](https:// "title") ')
      cy.getMarkdownBody()
        .find('p > a')
        .should('have.text', 'link text')
        .should('have.attr', 'href', 'https://')
        .should('have.attr', 'title', 'title')
    })
  })

  describe('pdf', () => {
    it('via enter', () => {
      cy.setCodemirrorContent('{')
      cy.get('.CodeMirror-hints').should('exist')
      cy.get('@codeinput').type('{enter}')
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('{%pdf https:// %}')
      cy.getMarkdownBody().find('p').should('exist')
    })
    it('via doubleclick', () => {
      cy.setCodemirrorContent('{')
      cy.get('.CodeMirror-hints > li').first().dblclick()
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('{%pdf https:// %}')
      cy.getMarkdownBody().find('p').should('exist')
    })
  })

  describe('collapsible blocks', () => {
    it('via enter', () => {
      cy.setCodemirrorContent('<d')
      cy.get('.CodeMirror-hints').should('exist')
      cy.get('@codeinput').type('{enter}')
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('</details>') // after selecting the hint, the last line of the inserted suggestion is active
      cy.getMarkdownBody().find('details').should('exist')
    })
    it('via doubleclick', () => {
      cy.setCodemirrorContent('<d')
      cy.get('.CodeMirror-hints > li').first().dblclick()
      cy.get('.CodeMirror-hints').should('not.exist')
      cy.get('.CodeMirror-activeline').contains('</details>')
      cy.getMarkdownBody().find('details').should('exist')
    })
  })
})
