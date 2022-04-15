/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const imageUrl = 'http://example.com/non-existing.png'

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
          url: '/api/mock-backend/private/media'
        },
        {
          statusCode: 201,
          body: {
            url: imageUrl
          }
        }
      )
    })
    it('via button', () => {
      cy.getByCypressId('editor-toolbar-upload-image-button').should('be.visible')
      cy.getByCypressId('editor-toolbar-upload-image-input').selectFile(
        {
          contents: '@demoImage',
          fileName: 'demo.png',
          mimeType: 'image/png'
        },
        { force: true }
      )
      cy.get('.cm-line').contains(`![](${imageUrl})`)
    })

    it('via paste', () => {
      cy.fixture('demo.png').then((image: string) => {
        const pasteEvent = {
          clipboardData: {
            files: [Cypress.Blob.base64StringToBlob(image, 'image/png')],
            getData: (_: string) => ''
          }
        }
        cy.get('.cm-content').trigger('paste', pasteEvent)
        cy.get('.cm-line').contains(`![](${imageUrl})`)
      })
    })

    it('via drag and drop', () => {
      cy.get('.cm-content').selectFile(
        {
          contents: '@demoImage',
          fileName: 'demo.png',
          mimeType: 'image/png'
        },
        { action: 'drag-drop', force: true }
      )
      cy.get('.cm-line').contains(`![](${imageUrl})`)
    })
  })

  it('fails', () => {
    cy.intercept(
      {
        method: 'POST',
        url: '/api/mock-backend/private/media'
      },
      {
        statusCode: 400
      }
    )
    cy.getByCypressId('editor-toolbar-upload-image-button').should('be.visible')
    cy.getByCypressId('editor-toolbar-upload-image-input').selectFile(
      {
        contents: '@demoImage',
        fileName: 'demo.png',
        mimeType: 'image/png'
      },
      { force: true }
    )
    cy.get('.cm-line').contains('![upload of demo.png failed]()')
  })

  it('lets text paste still work', () => {
    const testText = 'a long test text'
    const pasteEvent = {
      clipboardData: {
        getData: (type = 'text') => testText
      }
    }
    cy.get('.cm-content').trigger('paste', pasteEvent)
    cy.get('.cm-line').contains(`${testText}`)
  })
})
