/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Task lists ', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  describe('render with checkboxes ', () => {
    it('when unchecked', () => {
      cy.setCodemirrorContent('- [ ] abc\n\n* [ ] abc\n\n+ [ ] abc\n\n1. [ ] abc\n\n10. [ ] abc\n\n5) [ ] abc')
      cy.getMarkdownBody().find('input[type=checkbox]').should('have.length', 6)
    })

    it('when checked lowercase', () => {
      cy.setCodemirrorContent('- [x] abc\n\n* [x] abc\n\n+ [x] abc\n\n1. [x] abc\n\n10. [x] abc\n\n5) [x] abc')
      cy.getMarkdownBody().find('input[type=checkbox]').should('have.length', 6)
    })

    it('when checked uppercase', () => {
      cy.setCodemirrorContent('- [X] abc\n\n* [X] abc\n\n+ [X] abc\n\n1. [X] abc\n\n10. [X] abc\n\n5) [X] abc')
      cy.getMarkdownBody().find('input[type=checkbox]').should('have.length', 6)
    })
  })

  it('do not render as checkboxes when invalid', () => {
    cy.setCodemirrorContent('- [Y] abc\n\n* [  ] abc\n\n+ [-] abc\n\n1. [.] abc\n\n10. [] abc\n\n5) [-] abc')
    cy.getMarkdownBody().find('input[type=checkbox]').should('have.length', 0)
  })

  // TODO Re-enable tests as soon as cypress error is fixed.
  // These tests stopped working in cypress although manual testing works fine.
  // https://github.com/hedgedoc/hedgedoc/issues/5863

  // describe('are clickable and change the markdown source ', () => {
  //   it('from unchecked to checked', () => {
  //     cy.setCodemirrorContent('- [ ] abc')
  //     cy.getMarkdownBody()
  //       .find('input[type=checkbox]')
  //       .each((box) => {
  //         box.click()
  //       })
  //     cy.get('.cm-editor .cm-line').first().should('contain.text', '[x]').should('not.contain.text', '[ ]')
  //   })
  //
  //   it('from checked (lowercase) to unchecked', () => {
  //     cy.setCodemirrorContent('- [x] abc')
  //     cy.getMarkdownBody()
  //       .find('input[type=checkbox]')
  //       .each((box) => {
  //         box.click()
  //       })
  //     cy.get('.cm-editor .cm-line').should('exist').should('contain.text', '[ ]').should('not.contain.text', '[x]')
  //   })
  //
  //   it('from checked (uppercase) to unchecked', () => {
  //     cy.setCodemirrorContent('- [X] abc')
  //     cy.getMarkdownBody()
  //       .find('input[type=checkbox]')
  //       .each((box) => {
  //         box.click()
  //       })
  //     cy.get('.cm-editor .cm-line').should('exist').should('contain.text', '[ ]').should('not.contain.text', '[X]')
  //   })
  // })
})
