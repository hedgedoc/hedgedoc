/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Toolbar Buttons', () => {
  const testText = 'textText'
  const testLink = 'http://hedgedoc.org'

  beforeEach(() => {
    cy.visitTestEditor()

    cy.get('.CodeMirror').click().get('textarea').as('codeinput')
  })

  describe('for single line text', () => {
    beforeEach(() => {
      cy.setCodemirrorContent(testText)
      cy.get('.CodeMirror-line > span').should('exist').should('have.text', testText)
    })

    describe('with selection', () => {
      beforeEach(() => {
        cy.get('@codeinput').type('{ctrl}a')
      })

      it('should format as bold', () => {
        cy.getById('format-bold').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `**${testText}**`)
      })

      it('should format as italic', () => {
        cy.getById('format-italic').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `*${testText}*`)
      })

      it('should format as underline', () => {
        cy.getById('format-underline').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `++${testText}++`)
      })

      it('should format as strikethrough', () => {
        cy.get('.btn-toolbar  [data-cypress-id="format-strikethrough').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `~~${testText}~~`)
      })

      it('should format as subscript', () => {
        cy.getById('format-subscript').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `~${testText}~`)
      })

      it('should format as superscript', () => {
        cy.getById('format-superscript').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `^${testText}^`)
      })

      it('should format the line as code block', () => {
        cy.getById('format-code-block').click()
        cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span').should('have.text', '```')
        cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should('have.text', testText)
        cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span').should(
          'have.text',
          '```'
        )
      })

      it('should format links', () => {
        cy.getById('format-link').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `[${testText}](https://)`)
      })

      it('should format as image', () => {
        cy.getById('format-image').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `![${testText}](https://)`)
      })
    })

    it('should format line as heading', () => {
      cy.getById('format-heading').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `# ${testText}`)
      cy.get('.fa-header').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `## ${testText}`)
    })

    it('should format the line as code', () => {
      cy.getById('format-code-block').click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span').should('have.text', '```')
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should('have.text', testText)
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span').should('have.text', '```')
    })

    it('should add a quote', () => {
      cy.getById('format-block-quote').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `> ${testText}`)
      cy.getById('format-block-quote').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `> > ${testText}`)
    })

    it('should format as unordered list', () => {
      cy.getById('format-unordered-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `- ${testText}`)
      cy.getById('format-unordered-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `- - ${testText}`)
    })

    it('should format as ordered list', () => {
      cy.getById('format-ordered-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `1. ${testText}`)
      cy.getById('format-ordered-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `1. 1. ${testText}`)
    })

    it('should format as check list', () => {
      cy.getById('format-check-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `- [ ] ${testText}`)
      cy.getById('format-check-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `- [ ] - [ ] ${testText}`)
    })

    it('should insert links', () => {
      cy.getById('format-link').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `${testText}[](https://)`)
    })

    it('should insert an empty image link', () => {
      cy.getById('format-image').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `${testText}![](https://)`)
    })
  })

  describe('for single line link with selection', () => {
    beforeEach(() => {
      cy.setCodemirrorContent(testLink)
      cy.get('.CodeMirror-line > span').should('exist').should('have.text', testLink)
      cy.get('@codeinput').type('{ctrl}a')
    })

    it('should format as link', () => {
      cy.getById('format-link').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `[](${testLink})`)
    })

    it('should format as image', () => {
      cy.getById('format-image').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `![](${testLink})`)
    })
  })

  describe('for no text', () => {
    it('should add an empty code block', () => {
      cy.getById('format-code-block').click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span').should('have.text', '```')
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span').should('have.text', '```')
    })

    it('should insert lines', () => {
      cy.getById('format-add-line').click()
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should('have.text', '----')
    })

    it('should add a collapsable block', () => {
      cy.getById('format-collapsable-block').click()
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should(
        'have.text',
        ':::spoiler Toggle label'
      )
    })

    it('should add a comment', () => {
      cy.getById('format-add-comment').click()
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should('have.text', '> []')
    })
  })

  describe('for new tables', () => {
    beforeEach(() => {
      cy.get('.table-picker-container').should('not.be.visible')
      cy.getById('show-table-overlay').last().click()
      cy.get('.table-picker-container').should('be.visible')
    })

    it('should open an overlay', () => {
      cy.get('.table-container > div:nth-of-type(25)').trigger('mouseover')
      cy.get('.table-cell.bg-primary').should('have.length', 15)
      cy.get('.table-picker-container > p').contains('5x3')
      cy.get('.table-container > div:nth-of-type(25)').click()
    })

    it('should open a modal for custom table sizes in the overlay', () => {
      cy.get('.modal-dialog').should('not.exist')
      cy.getById('show-custom-table-modal').first().click()
      cy.get('.modal-dialog').should('be.visible')
      cy.get('.modal-content > .d-flex > input').first().type('5')
      cy.get('.modal-content > .d-flex > input').last().type('3')
      cy.get('.modal-footer > button').click()
    })

    afterEach(() => {
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should(
        'have.text',
        '|  # 1 |  # 2 |  # 3 |  # 4 |  # 5 |'
      )
      cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line > span  span').should(
        'have.text',
        '| ---- | ---- | ---- | ---- | ---- |'
      )
      cy.get('.CodeMirror-code > div:nth-of-type(4) > .CodeMirror-line > span  span').should(
        'have.text',
        '| Text | Text | Text | Text | Text |'
      )
      cy.get('.CodeMirror-code > div:nth-of-type(5) > .CodeMirror-line > span  span').should(
        'have.text',
        '| Text | Text | Text | Text | Text |'
      )
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span ').should(
        'have.text',
        '| Text | Text | Text | Text | Text |'
      )
    })
  })

  describe('for the emoji-picker', () => {
    it('should open overlay', () => {
      cy.get('emoji-picker').should('not.be.visible')
      cy.getById('show-emoji-picker').click()
      cy.get('emoji-picker').should('be.visible')
    })
  })
})
