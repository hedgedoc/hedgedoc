/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Export', () => {
  const testTitle = 'testContent'
  const testContent = `---\ntitle: ${testTitle}\n---\nThis is some test content`

  beforeEach(() => {
    cy.visitTestNote()
    cy.setCodemirrorContent(testContent)
  })

  it('Markdown', () => {
    cy.getByCypressId('menu-export').click()
    cy.getByCypressId('menu-export-markdown').click()
    cy.get('a[download]')
      .then(
        (anchor) =>
          new Cypress.Promise((resolve: any, _: any) => {
            // Use XHR to get the blob that corresponds to the object URL.
            const xhr = new XMLHttpRequest()
            xhr.open('GET', anchor.prop('href'), true)
            xhr.responseType = 'blob'

            // Once loaded, use FileReader to get the string back from the blob.
            xhr.onload = () => {
              if (xhr.status === 200) {
                const blob = xhr.response
                const reader = new FileReader()
                reader.onload = () => {
                  // Once we have a string, resolve the promise to let
                  // the Cypress chain continue, e.g. to assert on the result.
                  resolve(reader.result)
                }
                reader.readAsText(blob)
              }
            }
            xhr.send()
          })
      )
      // Now the regular Cypress assertions should work.
      .should('equal', testContent)
  })
})
