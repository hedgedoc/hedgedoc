/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Diagram codeblock ', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  /*
   TODO: Readd test after fixing https://github.com/hedgedoc/react-client/issues/1709

   it('renders markmap', () => {
   cy.setCodemirrorContent('```markmap\n- pro\n- contra\n```')
   cy.getMarkdownBody().findByCypressId('markmap').children().should('be.visible')
   })
   */

  it('renders vega-lite', () => {
    cy.setCodemirrorContent(
      '```vega-lite\n{"$schema":"https://vega.github.io/schema/vega-lite/v4.json","data":{"values":[{"a":"","b":28}]},"mark":"bar","encoding":{"x":{"field":"a"},"y":{"field":"b"}}}\n```'
    )
    cy.getMarkdownBody().find('.vega-embed').children().should('be.visible')
  })

  it('renders graphviz', () => {
    cy.setCodemirrorContent('```graphviz\ngraph {\na -- b\n}\n```')
    cy.getMarkdownBody().findByCypressId('graphviz').children().should('be.visible')
  })

  it('renders mermaid', () => {
    cy.setCodemirrorContent('```mermaid\ngraph TD;\n    A-->B;\n```')
    cy.getMarkdownBody().findByCypressId('mermaid-frame').children().should('be.visible')
  })

  it('renders flowcharts', () => {
    cy.setCodemirrorContent('```flow\nst=>start: Start\ne=>end: End\nst->e\n```')
    cy.getMarkdownBody().findByCypressId('flowchart').children().should('be.visible')
  })

  it('renders abc scores', () => {
    cy.setCodemirrorContent('```abc\nM:4/4\nK:G\n|:GABc dedB:|\n```')
    cy.getMarkdownBody().findByCypressId('abcjs').children().should('be.visible')
  })

  it('renders csv as table', () => {
    cy.setCodemirrorContent('```csv delimiter=; header\na;b;c;d\n1;2;3;4\n```')
    cy.getMarkdownBody().findByCypressId('csv-html-table').first().should('be.visible')
  })

  it('renders plantuml', () => {
    cy.setCodemirrorContent('```plantuml\nclass Example\n```')
    cy.getMarkdownBody()
      .find('img')
      // PlantUML uses base64 encoded version of zip-deflated PlantUML code in the request URL.
      .should('have.attr', 'src', 'http://mock-plantuml.local/svg/SoWkIImgAStDuKhEIImkLd2jICmjo4dbSaZDIm6A0W00')
  })
})
