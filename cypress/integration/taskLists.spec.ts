/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const TEST_STRING_UNCHECKED = '- [ ] abc\n\n* [ ] abc\n\n+ [ ] abc\n\n1. [ ] abc\n\n10. [ ] abc\n\n5) [ ] abc'
const TEST_STRING_CHECKED_LOWER = '- [x] abc\n\n* [x] abc\n\n+ [x] abc\n\n1. [x] abc\n\n10. [x] abc\n\n5) [x] abc'
const TEST_STRING_CHECKED_UPPER = '- [X] abc\n\n* [X] abc\n\n+ [X] abc\n\n1. [X] abc\n\n10. [X] abc\n\n5) [X] abc'
const TEST_STRING_INVALID = '- [Y] abc\n\n* [  ] abc\n\n+ [-] abc\n\n1. [.] abc\n\n10. [] abc\n\n5) [-] abc'

describe('Task lists ', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  describe('render with checkboxes ', () => {
    it('when unchecked', () => {
      cy.setCodemirrorContent(TEST_STRING_UNCHECKED)
      cy.getMarkdownBody().find('input[type=checkbox]').should('have.length', 6)
    })

    it('when checked lowercase', () => {
      cy.setCodemirrorContent(TEST_STRING_CHECKED_LOWER)
      cy.getMarkdownBody().find('input[type=checkbox]').should('have.length', 6)
    })

    it('when checked uppercase', () => {
      cy.setCodemirrorContent(TEST_STRING_CHECKED_UPPER)
      cy.getMarkdownBody().find('input[type=checkbox]').should('have.length', 6)
    })
  })

  it('do not render as checkboxes when invalid', () => {
    cy.setCodemirrorContent(TEST_STRING_INVALID)
    cy.getMarkdownBody().find('input[type=checkbox]').should('have.length', 0)
  })

  describe('are clickable and change the markdown source ', () => {
    it('from unchecked to checked', () => {
      cy.setCodemirrorContent(TEST_STRING_UNCHECKED)
      cy.getMarkdownBody()
        .find('input[type=checkbox]')
        .each((box) => {
          box.trigger('click')
        })
      cy.get('.CodeMirror-line > span').should('exist').should('contain.text', '[x]').should('not.contain.text', '[ ]')
    })

    it('from checked (lowercase) to unchecked', () => {
      cy.setCodemirrorContent(TEST_STRING_CHECKED_LOWER)
      cy.getMarkdownBody()
        .find('input[type=checkbox]')
        .each((box) => {
          box.trigger('click')
        })
      cy.get('.CodeMirror-line > span').should('exist').should('contain.text', '[ ]').should('not.contain.text', '[x]')
    })

    it('from checked (uppercase) to unchecked', () => {
      cy.setCodemirrorContent(TEST_STRING_CHECKED_UPPER)
      cy.getMarkdownBody()
        .find('input[type=checkbox]')
        .each((box) => {
          box.trigger('click')
        })
      cy.get('.CodeMirror-line > span').should('exist').should('contain.text', '[ ]').should('not.contain.text', '[X]')
    })
  })
})
