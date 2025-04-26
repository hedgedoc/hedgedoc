/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { convertHtmlToReact, ParserOptions } from './convertHtmlToReact.js'
import { convertNodeToReactElement } from './convertNodeToReactElement.js'
import { Document, isTag, isText } from 'domhandler'
import { NodeToReactElementTransformer } from './NodeToReactElementTransformer.js'
import React, { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { ElementType } from 'htmlparser2'

function parseHtmlToReactHtml(html: string, options: ParserOptions = {}) {
  return renderToStaticMarkup(<div>{convertHtmlToReact(html, options)}</div>)
}

function expectedHtml(html: string) {
  return `<div>${html}</div>`
}

describe('Integration tests', () => {
  it('should render a simple element', () => {
    const markup = '<div>test</div>'
    expect(parseHtmlToReactHtml(markup)).toBe(expectedHtml(markup))
  })

  it('should render multiple sibling elements', () => {
    const markup = '<div>test1</div><span>test2</span><footer>test3</footer>'
    expect(parseHtmlToReactHtml(markup)).toBe(expectedHtml(markup))
  })

  it('should render nested elements', () => {
    const markup =
      '<div><span>test1</span><div><ul><li>test2</li><li>test3</li></ul></div></div>'
    expect(parseHtmlToReactHtml(markup)).toBe(expectedHtml(markup))
  })

  it('should handle bad html', () => {
    expect(
      parseHtmlToReactHtml(
        '<div class=test>test<ul><li>test1<li>test2</ul><span>test</span></div>'
      )
    ).toBe(
      expectedHtml(
        '<div class="test">test<ul><li>test1</li><li>test2</li></ul><span>test</span></div>'
      )
    )
  })

  it('should ignore doctypes', () => {
    expect(parseHtmlToReactHtml('<!doctype html><div>test</div>')).toBe(
      expectedHtml('<div>test</div>')
    )
  })

  it('should ignore comments', () => {
    expect(
      parseHtmlToReactHtml('<div>test1</div><!-- comment --><div>test2</div>')
    ).toBe(parseHtmlToReactHtml('<div>test1</div><div>test2</div>'))
  })

  it('should ignore script tags', () => {
    expect(parseHtmlToReactHtml('<script>alert(1)</script>')).toBe(
      expectedHtml('')
    )
  })

  it('should ignore event handlers', () => {
    expect(
      parseHtmlToReactHtml('<a href="#" onclick="alert(1)">test</a>')
    ).toBe(expectedHtml('<a href="#">test</a>'))
  })

  it('should handle attributes', () => {
    const markup =
      '<div class="test" id="test" aria-valuetext="test" data-test="test">test</div>'
    expect(parseHtmlToReactHtml(markup)).toBe(expectedHtml(markup))
  })

  it('should handle inline styles', () => {
    const markup = '<div style="border-radius:1px;background:red">test</div>'
    expect(parseHtmlToReactHtml(markup)).toBe(expectedHtml(markup))
  })

  it('should ignore inline styles that are empty strings', () => {
    expect(parseHtmlToReactHtml('<div style="">test</div>')).toBe(
      expectedHtml('<div>test</div>')
    )
  })

  it('should not allow nesting of void elements', () => {
    expect(parseHtmlToReactHtml('<input><p>test</p></input>')).toBe(
      expectedHtml('<input/><p>test</p>')
    )
  })

  it('should convert boolean attribute values', () => {
    expect(parseHtmlToReactHtml('<input disabled>')).toBe(
      expectedHtml('<input disabled=""/>')
    )
    expect(parseHtmlToReactHtml('<input disabled="">')).toBe(
      expectedHtml('<input disabled=""/>')
    )
    expect(parseHtmlToReactHtml('<input disabled="disabled">')).toBe(
      expectedHtml('<input disabled=""/>')
    )
  })
  ;[
    ['CONTENTEDITABLE', 'contentEditable'],
    ['LABEL', 'label'],
    ['iTemREF', 'itemRef']
  ].forEach(([attr, prop]) => {
    it(`should convert attribute ${attr} to prop ${prop}`, () => {
      const nodes = convertHtmlToReact(`<div ${attr}/>`, {})
      expect(nodes).toHaveLength(1)
      expect((nodes[0] as ReactElement).props).toHaveProperty(prop)
    })
  })

  it('should decode html entities by default', () => {
    expect(parseHtmlToReactHtml('<span>&excl;</span>')).toBe(
      expectedHtml('<span>!</span>')
    )
  })

  it('should not decode html entities when the option is disabled', () => {
    expect(
      parseHtmlToReactHtml('<span>&excl;</span>', {
        decodeEntities: false
      })
    ).toBe(expectedHtml('<span>&amp;excl;</span>'))
  })

  describe('transform function', () => {
    it('should use the response when it is not undefined', () => {
      expect(
        parseHtmlToReactHtml('<span>test</span><div>another</div>', {
          transform(node, index) {
            return <p key={index}>transformed</p>
          }
        })
      ).toBe(expectedHtml('<p>transformed</p><p>transformed</p>'))
    })

    it('should not render elements and children when returning null', () => {
      expect(
        parseHtmlToReactHtml(
          '<p>test<span>inner test<b>bold child</b></span></p>',
          {
            transform(node) {
              if (
                isTag(node) &&
                ElementType.isTag(node) &&
                node.name === 'span'
              ) {
                return null
              }
            }
          }
        )
      ).toBe(expectedHtml('<p>test</p>'))
    })

    it('should allow modifying nodes', () => {
      expect(
        parseHtmlToReactHtml('<a href="/test">test link</a>', {
          transform(node, index) {
            if (isTag(node)) {
              node.attribs.href = '/changed'
            }
            return convertNodeToReactElement(node, index)
          }
        })
      ).toBe(expectedHtml('<a href="/changed">test link</a>'))
    })

    it('should allow passing the transform function down to children', () => {
      const transform: NodeToReactElementTransformer = (node, index) => {
        if (isTag(node)) {
          if (node.name === 'ul') {
            node.attribs.class = 'test'
            return convertNodeToReactElement(node, index, transform)
          }
        } else if (isText(node)) {
          return node.data.replace(/list/, 'changed')
        } else {
          return null
        }
      }
      expect(
        parseHtmlToReactHtml('<ul><li>list 1</li><li>list 2</li></ul>', {
          transform
        })
      ).toBe(
        expectedHtml(
          '<ul class="test"><li>changed 1</li><li>changed 2</li></ul>'
        )
      )
    })
  })

  it('should not render invalid tags', () => {
    expect(parseHtmlToReactHtml('<div>test<test</div>')).toBe(
      expectedHtml('<div>test</div>')
    )
  })

  it('should not render invalid attributes', () => {
    expect(
      parseHtmlToReactHtml('<div data-test<="test" class="test">content</div>')
    ).toBe(expectedHtml('<div class="test">content</div>'))
  })

  it('should preprocess nodes correctly', () => {
    expect(
      parseHtmlToReactHtml('<div>preprocess test</div>', {
        preprocessNodes(document) {
          return new Document([...document.childNodes, ...document.childNodes])
        }
      })
    ).toBe(expectedHtml('<div>preprocess test</div><div>preprocess test</div>'))
  })
})
