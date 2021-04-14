/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('markdown formatted links to', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  it('external domains render as external link', () => {
    cy.codemirrorFill('[external](https://hedgedoc.org/)')
    cy.getMarkdownBody()
      .find('a')
      .should('have.attr', 'href', 'https://hedgedoc.org/')
      .should('have.attr', 'rel', 'noreferer noopener')
      .should('have.attr', 'target', '_blank')
  })

  it('note anchor references render as anchor link', () => {
    cy.codemirrorFill('[anchor](#anchor)')
    cy.getMarkdownBody()
      .find('a')
      .should('have.attr', 'href', 'http://127.0.0.1:3001/n/test#anchor')
  })

  it('internal pages render as internal link', () => {
    cy.codemirrorFill('[internal](other-note)')
    cy.getMarkdownBody()
      .find('a')
      .should('have.attr', 'href', 'http://127.0.0.1:3001/n/other-note')
  })

  it('data URIs do not render', () => {
    cy.codemirrorFill('[data](data:text/plain,evil)')
    cy.getMarkdownBody()
      .find('a')
      .should('not.exist')
  })

  it('javascript URIs do not render', () => {
    cy.codemirrorFill('[js](javascript:alert("evil"))')
    cy.getMarkdownBody()
      .find('a')
      .should('not.exist')
  })
})

describe('HTML anchor element links to', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  it('external domains render as external link', () => {
    cy.codemirrorFill('<a href="https://hedgedoc.org/">external</a>')
    cy.getMarkdownBody()
      .find('a')
      .should('have.attr', 'href', 'https://hedgedoc.org/')
      .should('have.attr', 'rel', 'noreferer noopener')
      .should('have.attr', 'target', '_blank')
  })

  it('note anchor references render as anchor link', () => {
    cy.codemirrorFill('<a href="#anchor">anchor</a>')
    cy.getMarkdownBody()
      .find('a')
      .should('have.attr', 'href', 'http://127.0.0.1:3001/n/test#anchor')
  })

  it('internal pages render as internal link', () => {
    cy.codemirrorFill('<a href="other-note">internal</a>')
    cy.getMarkdownBody()
      .find('a')
      .should('have.attr', 'href', 'http://127.0.0.1:3001/n/other-note')
  })

  it('data URIs do not render', () => {
    cy.codemirrorFill('<a href="data:text/plain,evil">data</a>')
    cy.getMarkdownBody()
      .find('a')
      .should('not.exist')
  })

  it('javascript URIs do not render', () => {
    cy.codemirrorFill('<a href="javascript:alert(\'evil\')">js</a>')
    cy.getMarkdownBody()
      .find('a')
      .should('not.exist')
  })
})
