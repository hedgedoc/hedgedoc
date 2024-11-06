/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const fakeUuid = '77fdcf1c-35fa-4a65-bdcf-1c35fa8a65d5'

describe('File upload', () => {
  beforeEach(() => {
    cy.visitTestNote()
    cy.fixture('demo.png').as('demoImage')
  })

  describe('works', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'POST',
          url: '/api/private/media'
        },
        {
          statusCode: 201,
          body: {
            uuid: fakeUuid,
            fileName: 'demo.png'
          }
        }
      )
    })
    it('via button', () => {
      cy.getByCypressId('editor-pane').should('have.attr', 'data-cypress-editor-ready', 'true')
      cy.getByCypressId('toolbar.uploadImage').should('be.visible')
      cy.getByCypressId('toolbar.uploadImage.input').selectFile(
        {
          contents: '@demoImage',
          fileName: 'demo.png',
          mimeType: 'image/png'
        },
        { force: true }
      )
      cy.get('.cm-line').contains(`![demo.png](http://127.0.0.1:3001/media/${fakeUuid})`)
    })

    it('via paste', () => {
      cy.getByCypressId('editor-pane').should('have.attr', 'data-cypress-editor-ready', 'true')
      cy.fixture('demo.png').then((image: string) => {
        const pasteEvent = {
          clipboardData: {
            files: [Cypress.Blob.base64StringToBlob(image, 'image/png')],
            getData: () => ''
          }
        }
        cy.get('.cm-content').trigger('paste', pasteEvent)
        cy.get('.cm-line').contains(`![](http://127.0.0.1:3001/media/${fakeUuid})`)
      })
    })

    it('via drag and drop', () => {
      cy.getByCypressId('editor-pane').should('have.attr', 'data-cypress-editor-ready', 'true')
      cy.get('.cm-content').selectFile(
        {
          contents: '@demoImage',
          fileName: 'demo.png',
          mimeType: 'image/png'
        },
        { action: 'drag-drop', force: true }
      )
      cy.get('.cm-line').contains(`![demo.png](http://127.0.0.1:3001/media/${fakeUuid})`)
    })
  })

  describe('fails', () => {
    it('with 400 - generic error', () => {
      cy.getByCypressId('editor-pane').should('have.attr', 'data-cypress-editor-ready', 'true')
      cy.intercept(
        {
          method: 'POST',
          url: '/api/private/media'
        },
        {
          statusCode: 400
        }
      )
      cy.getByCypressId('toolbar.uploadImage').should('be.visible')
      cy.getByCypressId('toolbar.uploadImage.input').selectFile(
        {
          contents: '@demoImage',
          fileName: 'demo.png',
          mimeType: 'image/png'
        },
        { force: true }
      )
      cy.get('.cm-line')
        .should(($el) => {
          expect($el.text().trim()).equal('')
        })
      cy.getByCypressId('notification-toast').should('be.visible')
    })

    it('with 413 - file size error', () => {
      cy.getByCypressId('editor-pane').should('have.attr', 'data-cypress-editor-ready', 'true')
      cy.intercept(
        {
          method: 'POST',
          url: '/api/private/media'
        },
        {
          statusCode: 413
        }
      )
      cy.getByCypressId('toolbar.uploadImage').should('be.visible')
      cy.getByCypressId('toolbar.uploadImage.input').selectFile(
        {
          contents: '@demoImage',
          fileName: 'demo.png',
          mimeType: 'image/png'
        },
        { force: true }
      )
      cy.get('.cm-line')
        .should(($el) => {
          expect($el.text().trim()).equal('')
        })
      cy.getByCypressId('notification-toast').should('be.visible')
    })
  })

  it('lets text paste still work', () => {
    cy.getByCypressId('editor-pane').should('have.attr', 'data-cypress-editor-ready', 'true')
    const testText = 'a long test text'

    const pasteEvent: Event = Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
      clipboardData: {
        files: [],
        getData: () => testText
      }
    })

    cy.get('.cm-content').trigger('paste', pasteEvent)
    cy.get('.cm-line').contains(`${testText}`)
  })
})
