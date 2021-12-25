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
        cy.getByCypressId('format-bold').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `**${testText}**`)
      })

      it('should format as italic', () => {
        cy.getByCypressId('format-italic').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `*${testText}*`)
      })

      it('should format as underline', () => {
        cy.getByCypressId('format-underline').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `++${testText}++`)
      })

      it('should format as strikethrough', () => {
        cy.get('.btn-toolbar  [data-cypress-id="format-strikethrough').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `~~${testText}~~`)
      })

      it('should format as subscript', () => {
        cy.getByCypressId('format-subscript').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `~${testText}~`)
      })

      it('should format as superscript', () => {
        cy.getByCypressId('format-superscript').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `^${testText}^`)
      })

      it('should format the line as code block', () => {
        cy.getByCypressId('format-code-block').click()
        cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span').should('have.text', '```')
        cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should('have.text', testText)
        cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span').should(
          'have.text',
          '```'
        )
      })

      it('should format links', () => {
        cy.getByCypressId('format-link').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `[${testText}](https://)`)
      })

      it('should format as image', () => {
        cy.getByCypressId('format-image').click()
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `![${testText}](https://)`)
      })
    })

    it('should format line as heading', () => {
      cy.getByCypressId('format-heading').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `# ${testText}`)
      cy.get('.fa-header').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `## ${testText}`)
    })

    it('should format the line as code', () => {
      cy.getByCypressId('format-code-block').click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span').should('have.text', '```')
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should('have.text', testText)
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span').should('have.text', '```')
    })

    it('should add a quote', () => {
      cy.getByCypressId('format-block-quote').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `> ${testText}`)
      cy.getByCypressId('format-block-quote').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `> > ${testText}`)
    })

    it('should format as unordered list', () => {
      cy.getByCypressId('format-unordered-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `- ${testText}`)
      cy.getByCypressId('format-unordered-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `- - ${testText}`)
    })

    it('should format as ordered list', () => {
      cy.getByCypressId('format-ordered-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `1. ${testText}`)
      cy.getByCypressId('format-ordered-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `1. 1. ${testText}`)
    })

    it('should format as check list', () => {
      cy.getByCypressId('format-check-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `- [ ] ${testText}`)
      cy.getByCypressId('format-check-list').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `- [ ] - [ ] ${testText}`)
    })

    it('should insert links', () => {
      cy.getByCypressId('format-link').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `${testText}[](https://)`)
    })

    it('should insert an empty image link', () => {
      cy.getByCypressId('format-image').click()
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
      cy.getByCypressId('format-link').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `[](${testLink})`)
    })

    it('should format as image', () => {
      cy.getByCypressId('format-image').click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span').should('have.text', `![](${testLink})`)
    })
  })

  describe('for no text', () => {
    it('should add an empty code block', () => {
      cy.getByCypressId('format-code-block').click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span').should('have.text', '```')
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span').should('have.text', '```')
    })

    it('should insert lines', () => {
      cy.getByCypressId('format-add-line').click()
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should('have.text', '----')
    })

    it('should add a collapsable block', () => {
      cy.getByCypressId('format-collapsable-block').click()
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should(
        'have.text',
        ':::spoiler Toggle label'
      )
    })

    it('should add a comment', () => {
      cy.getByCypressId('format-add-comment').click()
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span').should('have.text', '> []')
    })
  })

  describe('for new tables', () => {
    beforeEach(() => {
      cy.getByCypressId('table-size-picker-popover').should('not.exist')
      cy.getByCypressId('table-size-picker-button').last().click()
      cy.getByCypressId('table-size-picker-popover').should('be.visible')
    })

    it('should select table size', () => {
      cy.getByCypressId('table-size-picker-popover')
        .find('[data-cypress-col=5][data-cypress-row=3]')
        .trigger('mouseover')
      cy.getByCypressId('table-size-picker-popover').find('[data-cypress-selected="true"]').should('have.length', 15)
      cy.getByCypressId('table-size-picker-popover').find('.popover-header').contains('5x3')
      cy.getByCypressId('table-size-picker-popover').find('[data-cypress-col=5][data-cypress-row=3]').click()
    })

    it('should open a custom table size in the modal', () => {
      cy.getByCypressId('custom-table-size-modal').should('not.exist')
      cy.getByCypressId('show-custom-table-modal').first().click()
      cy.getByCypressId('custom-table-size-modal').should('be.visible')
      cy.getByCypressId('custom-table-size-modal').find('input').first().type('5')
      cy.getByCypressId('custom-table-size-modal').find('input').last().type('3')
      cy.getByCypressId('custom-table-size-modal').find('.modal-footer > button').click()
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
      cy.getByCypressId('show-emoji-picker').click()
      cy.get('emoji-picker').should('be.visible')
    })
  })
})
