/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const imageUrl = 'http://example.com/non-existing.png'

describe('File upload', () => {
  beforeEach(() => {
    cy.visitTestEditor()
  })

  it('doesn\'t prevent drag\'n\'drop of plain text', () => {
    const dataTransfer = new DataTransfer()
    cy.codemirrorFill('line 1\nline 2\ndragline')
    cy.get('.CodeMirror')
      .click()
    cy.get('.CodeMirror-line > span')
      .last()
      .dblclick()
    cy.get('.CodeMirror-line > span > .cm-matchhighlight')
      .trigger('dragstart', { dataTransfer })
    cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span  span')
      .trigger('drop', { dataTransfer })
    cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span  span')
      .should('have.text', 'lindraglinee 1')
  })

  describe('upload works', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'POST',
        url: '/api/v2/media/upload'
      }, {
        statusCode: 201,
        body: {
          link: imageUrl
        }
      })
    })
    it('via button', () => {
      cy.get('.fa-upload')
        .click()
      cy.get('div.btn-group > input[type=file]')
        .attachFile({ filePath: 'acme.png', mimeType: 'image/png' })
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `![](${imageUrl})`)
    })

    it('via paste', () => {
      cy.fixture('acme.png').then((image: string) => {
        const pasteEvent = {
          clipboardData: {
            files: [Cypress.Blob.base64StringToBlob(image, 'image/png')]
          }
        }
        cy.get('.CodeMirror-scroll').trigger('paste', pasteEvent)
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
          .should('have.text', `![](${imageUrl})`)
      })
    })

    it('via drag and drop', () => {
      cy.fixture('acme.png').then((image: string) => {
        const dropEvent = {
          dataTransfer: {
            files: [Cypress.Blob.base64StringToBlob(image, 'image/png')],
            effectAllowed: 'uninitialized'
          }
        }
        cy.get('.CodeMirror-scroll').trigger('dragenter', dropEvent)
        cy.get('.CodeMirror-scroll').trigger('drop', dropEvent)
        cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
          .should('have.text', `![](${imageUrl})`)
      })
    })
  })

  it('upload fails', () => {
    cy.intercept({
      method: 'POST',
      url: '/api/v2/media/upload'
    }, {
      statusCode: 400
    })
    cy.get('.fa-upload')
      .click()
    cy.fixture('acme.png').then(() => {
      cy.get('input[type=file]')
        .attachFile({ filePath: 'acme.png', mimeType: 'image/png' })
    })
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span > span')
      .should('have.text', String.fromCharCode(8203)) //thanks codemirror....
  })

  it('text paste still works', () => {
    const testText = 'a long test text'
    const pasteEvent = {
      clipboardData: {
        getData: (type = 'text') => testText
      }
    }
    cy.get('.CodeMirror-scroll').trigger('paste', pasteEvent)
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `${testText}`)
  })
})
