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
import { describe, expect, it } from '@jest/globals'

const expectSameHtml = function (html: string, options: ParserOptions = {}) {
  const actual = renderToStaticMarkup(<div>{convertHtmlToReact(html, options)}</div>)
  const expected = `<div>${html}</div>`
  expect(actual).toBe(expected)
}

const expectOtherHtml = function (html: string, override: string, options: ParserOptions = {}) {
  const actual = renderToStaticMarkup(<div>{convertHtmlToReact(html, options)}</div>)
  const expected = `<div>${override}</div>`
  expect(actual).toBe(expected)
}

describe('Integration tests: ', () => {
  it('should render a simple element', () => {
    expectSameHtml('<div>test</div>')
  })

  it('should render multiple sibling elements', () => {
    expectSameHtml('<div>test1</div><span>test2</span><footer>test3</footer>')
  })

  it('should render nested elements', () => {
    expectSameHtml('<div><span>test1</span><div><ul><li>test2</li><li>test3</li></ul></div></div>')
  })

  it('should handle bad html', () => {
    expectOtherHtml(
      '<div class=test>test<ul><li>test1<li>test2</ul><span>test</span></div>',
      '<div class="test">test<ul><li>test1</li><li>test2</li></ul><span>test</span></div>'
    )
  })

  it('should ignore doctypes', () => {
    expectOtherHtml('<!doctype html><div>test</div>', '<div>test</div>')
  })

  it('should ignore comments', () => {
    expectOtherHtml('<div>test1</div><!-- comment --><div>test2</div>', '<div>test1</div><div>test2</div>')
  })

  it('should ignore script tags', () => {
    expectOtherHtml('<script>alert(1)</script>', '')
  })

  it('should ignore event handlers', () => {
    expectOtherHtml('<a href="#" onclick="alert(1)">test</a>', '<a href="#">test</a>')
  })

  it('should handle attributes', () => {
    expectSameHtml('<div class="test" id="test" aria-valuetext="test" data-test="test">test</div>')
  })

  it('should handle inline styles', () => {
    expectSameHtml('<div style="border-radius:1px;background:red">test</div>')
  })

  it('should ignore inline styles that are empty strings', () => {
    expectOtherHtml('<div style="">test</div>', '<div>test</div>')
  })

  it('should not allow nesting of void elements', () => {
    expectOtherHtml('<input><p>test</p></input>', '<input/><p>test</p>')
  })

  it('should convert boolean attribute values', () => {
    expectOtherHtml('<input disabled>', '<input disabled=""/>')
    expectOtherHtml('<input disabled="">', '<input disabled=""/>')
    expectOtherHtml('<input disabled="disabled">', '<input disabled=""/>')
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
    expectOtherHtml('<span>&excl;</span>', '<span>!</span>')
  })

  it('should not decode html entities when the option is disabled', () => {
    expectOtherHtml('<span>&excl;</span>', '<span>&amp;excl;</span>', {
      decodeEntities: false
    })
  })

  describe('transform function', () => {
    it('should use the response when it is not undefined', () => {
      expectOtherHtml('<span>test</span><div>another</div>', '<p>transformed</p><p>transformed</p>', {
        transform(node, index) {
          return <p key={index}>transformed</p>
        }
      })
    })

    it('should not render elements and children when returning null', () => {
      expectOtherHtml('<p>test<span>inner test<b>bold child</b></span></p>', '<p>test</p>', {
        transform(node) {
          if (isTag(node) && node.type === 'tag' && node.name === 'span') {
            return null
          }
        }
      })
    })

    it('should allow modifying nodes', () => {
      expectOtherHtml('<a href="/test">test link</a>', '<a href="/changed">test link</a>', {
        transform(node, index) {
          if (isTag(node)) {
            node.attribs.href = '/changed'
          }
          return convertNodeToReactElement(node, index)
        }
      })
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
      expectOtherHtml(
        '<ul><li>list 1</li><li>list 2</li></ul>',
        '<ul class="test"><li>changed 1</li><li>changed 2</li></ul>',
        {
          transform
        }
      )
    })
  })

  it('should not render invalid tags', () => {
    expectOtherHtml('<div>test<test</div>', '<div>test</div>')
  })

  it('should not render invalid attributes', () => {
    expectOtherHtml('<div data-test<="test" class="test">content</div>', '<div class="test">content</div>')
  })

  it('should preprocess nodes correctly', () => {
    expectOtherHtml('<div>preprocess test</div>', '<div>preprocess test</div><div>preprocess test</div>', {
      preprocessNodes(document) {
        return new Document([...document.childNodes, ...document.childNodes])
      }
    })
  })
})
