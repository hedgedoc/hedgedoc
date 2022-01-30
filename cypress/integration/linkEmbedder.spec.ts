/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Link gets replaced with embedding: ', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  // TODO Add general testing of one-click-embedding component. The tests below just test a specific use of the component.

  it('GitHub Gist', () => {
    cy.setCodemirrorContent('https://gist.github.com/schacon/1')
    cy.getMarkdownBody().findByCypressId('click-shield-gist').find('.preview-background').parent().click()
    cy.getMarkdownBody().findByCypressId('gh-gist').should('be.visible')
  })

  it('YouTube', () => {
    cy.setCodemirrorContent('https://www.youtube.com/watch?v=YE7VzlLtp-4')
    cy.getMarkdownBody()
      .findByCypressId('click-shield-youtube')
      .find('.preview-background')
      .should('have.attr', 'src', 'https://i.ytimg.com/vi/YE7VzlLtp-4/maxresdefault.jpg')
      .parent()
      .click()
    cy.getMarkdownBody()
      .find('iframe')
      .should('have.attr', 'src', 'https://www.youtube-nocookie.com/embed/YE7VzlLtp-4?autoplay=1')
  })

  it('Vimeo', () => {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://vimeo.com/api/v2/video/23237102.json'
      },
      {
        statusCode: 200,
        headers: {
          'content-type': 'application/json'
        },
        body: '[{"thumbnail_large": "https://i.vimeocdn.com/video/503631401_640.jpg"}]'
      }
    )
    cy.setCodemirrorContent('https://vimeo.com/23237102')
    cy.getMarkdownBody()
      .findByCypressId('click-shield-vimeo')
      .find('.preview-background')
      .should('have.attr', 'src', 'https://i.vimeocdn.com/video/503631401_640.jpg')
      .parent()
      .click()
    cy.getMarkdownBody().find('iframe').should('have.attr', 'src', 'https://player.vimeo.com/video/23237102?autoplay=1')
  })
})
