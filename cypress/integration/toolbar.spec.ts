/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Toolbar', () => {
  const testText = 'textText'
  const testLink = 'http://hedgedoc.org'

  beforeEach(() => {
    cy.visit('/n/test')

    cy.get('.CodeMirror')
      .click()
      .get('textarea')
      .as('codeinput')
  })

  const fillTestText = () => {
    cy.get('@codeinput')
      .fill(testText)
    cy.get('.CodeMirror-line > span')
      .should("exist")
      .should('have.text', testText)
  }

  const fillTestLink = () => {
    cy.get('@codeinput')
      .fill(testLink)
    cy.get('.CodeMirror-line > span')
      .should("exist")
      .should('have.text', testLink)
  }

  it('bold', () => {
    fillTestText()
    cy.get('@codeinput')
      .type('{ctrl}a')
    cy.get('.fa-bold')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `**${testText}**`)
  })

  it('italic', () => {
    fillTestText()
    cy.get('@codeinput')
      .type('{ctrl}a')
    cy.get('.fa-italic')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `*${testText}*`)
  })

  it('underline', () => {
    fillTestText()
    cy.get('@codeinput')
      .type('{ctrl}a')
    cy.get('.fa-underline')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `++${testText}++`)
  })

  it('strikethrough', () => {
    fillTestText()
    cy.get('@codeinput')
      .type('{ctrl}a')
    cy.get('.fa-strikethrough')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `~~${testText}~~`)
  })

  it('subscript', () => {
    fillTestText()
    cy.get('@codeinput')
      .type('{ctrl}a')
    cy.get('.fa-subscript')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `~${testText}~`)
  })

  it('superscript', () => {
    fillTestText()
    cy.get('@codeinput')
      .type('{ctrl}a')
    cy.get('.fa-superscript')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `^${testText}^`)
  })

  it('heading', () => {
    fillTestText()
    cy.get('.fa-header')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `# ${testText}`)
    cy.get('.fa-header')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `## ${testText}`)
  })

  describe('code', () => {
    it('nothing selected empty line', () => {
      fillTestText()
      cy.get('@codeinput')
        .type('{ctrl}a')
        .type('{backspace}')
      cy.get('.fa-code')
        .click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
        .should('have.text', '```')
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span')
        .should('have.text', '```')
    })

    it('nothing selected non line', () => {
      fillTestText()
      cy.get('@codeinput')
        .type('{ctrl}a')
        .type('{leftArrow}')
      cy.get('.fa-code')
        .click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
        .should('have.text', '```')
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
        .should('have.text', testText)
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span')
        .should('have.text', '```')
    })

    it('line selected', () => {
      fillTestText()
      cy.get('@codeinput')
        .type('{ctrl}a')
      cy.get('.fa-code')
        .click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
        .should('have.text', '```')
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
        .should('have.text', testText)
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span')
        .should('have.text', '```')
    })
  })

  it('quote', () => {
    fillTestText()
    cy.get('.fa-quote-right')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `> ${testText}`)
    cy.get('.fa-quote-right')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `> > ${testText}`)
  })

  it('unordered list', () => {
    fillTestText()
    cy.get('.fa-list')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `- ${testText}`)
    cy.get('.fa-list')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `- - ${testText}`)
  })

  it('ordered list', () => {
    fillTestText()
    cy.get('.fa-list-ol')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `1. ${testText}`)
    cy.get('.fa-list-ol')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `1. 1. ${testText}`)
  })

  it('todo list', () => {
    fillTestText()
    cy.get('.fa-check-square')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `- [ ] ${testText}`)
    cy.get('.fa-check-square')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `- [ ] - [ ] ${testText}`)
  })

  describe('link', () => {
    it('with selection text', () => {
      fillTestText()
      cy.get('@codeinput')
        .type('{ctrl}a')
      cy.get('.fa-link')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `[${testText}](https://)`)
    })

    it('without selection', () => {
      fillTestText()
      cy.get('.fa-link')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `${testText}[](https://)`)
    })

    it('with selection link', () => {
      fillTestLink()
      cy.get('@codeinput')
        .type('{ctrl}a')
      cy.get('.fa-link')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `[](${testLink})`)
    })
  })

  describe('image', () => {
    it('with selection', () => {
      fillTestText()
      cy.get('@codeinput')
        .type('{ctrl}a')
      cy.get('.fa-picture-o')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `![${testText}](https://)`)
    })

    it('without selection', () => {
      fillTestText()
      cy.get('.fa-picture-o')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `${testText}![](https://)`)
    })

    it('with selection link', () => {
      fillTestLink()
      cy.get('@codeinput')
        .type('{ctrl}a')
      cy.get('.fa-picture-o')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `![](${testLink})`)
    })
  })

  describe('table', () => {
    beforeEach(() => {
      cy.get('.table-picker-container')
        .should('not.be.visible')
      cy.get('.fa-table')
        .last()
        .click()
      cy.get('.table-picker-container')
        .should('be.visible')
    })

    it('overlay', () => {
      cy.get('.table-container > div:nth-of-type(25)')
        .trigger('mouseover')
      cy.get('.table-cell.bg-primary')
        .should('have.length', 15)
      cy.get('.table-picker-container > p')
        .contains('5x3')
      cy.get('.table-container > div:nth-of-type(25)')
        .click()
    })

    it('custom', () => {
      cy.get('.modal-dialog')
        .should('not.exist')
      cy.get('.fa-table')
        .first()
        .click()
      cy.get('.modal-dialog')
        .should('be.visible')
      cy.get('.modal-content > .d-flex > input')
        .first()
        .type('5')
      cy.get('.modal-content > .d-flex > input')
        .last()
        .type('3')
      cy.get('.modal-footer > button')
        .click()
    })

    afterEach(() => {
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
        .should('have.text', '|  # 1 |  # 2 |  # 3 |  # 4 |  # 5 |')
      cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line > span  span')
        .should('have.text', '| ---- | ---- | ---- | ---- | ---- |')
      cy.get('.CodeMirror-code > div:nth-of-type(4) > .CodeMirror-line > span  span')
        .should('have.text', '| Text | Text | Text | Text | Text |')
      cy.get('.CodeMirror-code > div:nth-of-type(5) > .CodeMirror-line > span  span')
        .should('have.text', '| Text | Text | Text | Text | Text |')
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span ')
        .should('have.text', '| Text | Text | Text | Text | Text |')
    })
  })

  it('line', () => {
    cy.get('.fa-minus')
      .click()
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
      .should('have.text', '----')
  })

  it('collapsable block', () => {
    cy.get('.fa-caret-square-o-down')
      .click()
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
      .should('have.text', ':::spoiler Toggle label')
  })

  it('comment', () => {
    cy.get('.fa-comment')
      .click()
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
      .should('have.text', '> []')
  })

  describe('emoji-picker', () => {
    it('show when clicked', () => {
      cy.get('emoji-picker')
        .should('not.be.visible')
      cy.get('.fa-smile-o')
        .click()
      cy.get('emoji-picker')
        .should('be.visible')
    })
  })

})
