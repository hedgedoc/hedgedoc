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
          url: '/api/private/media'
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
      cy.get('.cm-line').contains(`![demo.png](${imageUrl})`)
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
        cy.get('.cm-line').contains(`![](${imageUrl})`)
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
      cy.get('.cm-line').contains(`![demo.png](${imageUrl})`)
    })
  })

  it('fails', () => {
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
    cy.get('.cm-line').contains('![upload of demo.png failed]()')
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
