/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HighlightedCodeProps } from '../../../components/common/highlighted-code/highlighted-code'
import * as HighlightedCodeModule from '../../../components/common/highlighted-code/highlighted-code'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { HighlightedCodeMarkdownExtension } from './highlighted-code-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('../../../components/common/highlighted-code/highlighted-code')

describe('Highlighted code markdown extension', () => {
  describe('renders', () => {
    beforeAll(async () => {
      jest.spyOn(HighlightedCodeModule, 'HighlightedCode').mockImplementation((({
        code,
        language,
        startLineNumber,
        wrapLines
      }) => {
        return (
          <span>
            this is a mock for highlighted code
            <code>{code}</code>
            <span>language: {language}</span>
            <span>start line number: {startLineNumber}</span>
            <span>wrap line: {wrapLines ? 'true' : 'false'}</span>
          </span>
        )
      }) as React.FC<HighlightedCodeProps>)
      await mockI18n()
    })

    describe('with just the language', () => {
      it("doesn't show a gutter", () => {
        const view = render(
          <TestMarkdownRenderer
            extensions={[new HighlightedCodeMarkdownExtension()]}
            content={'```javascript \nlet x = 0\n```'}
          />
        )
        expect(view.container).toMatchSnapshot()
      })

      describe('and line wrapping', () => {
        it("doesn't show a gutter", () => {
          const view = render(
            <TestMarkdownRenderer
              extensions={[new HighlightedCodeMarkdownExtension()]}
              content={'```javascript! \nlet x = 0\n```'}
            />
          )
          expect(view.container).toMatchSnapshot()
        })
      })
    })

    describe('with the language and show gutter', () => {
      it('shows the correct line number', () => {
        const view = render(
          <TestMarkdownRenderer
            extensions={[new HighlightedCodeMarkdownExtension()]}
            content={'```javascript= \nlet x = 0\n```'}
          />
        )
        expect(view.container).toMatchSnapshot()
      })

      describe('and line wrapping', () => {
        it('shows the correct line number', () => {
          const view = render(
            <TestMarkdownRenderer
              extensions={[new HighlightedCodeMarkdownExtension()]}
              content={'```javascript=! \nlet x = 0\n```'}
            />
          )
          expect(view.container).toMatchSnapshot()
        })
      })
    })

    describe('with the language, show gutter with a start number', () => {
      it('shows the correct line number', () => {
        const view = render(
          <TestMarkdownRenderer
            extensions={[new HighlightedCodeMarkdownExtension()]}
            content={'```javascript=100 \nlet x = 0\n```'}
          />
        )
        expect(view.container).toMatchSnapshot()
      })

      it('shows the correct line number and continues in another codeblock', () => {
        const view = render(
          <TestMarkdownRenderer
            extensions={[new HighlightedCodeMarkdownExtension()]}
            content={'```javascript=100 \nlet x = 0\nlet y = 1\n```\n\n```javascript=+\nlet y = 2\n```\n'}
          />
        )
        expect(view.container).toMatchSnapshot()
      })

      describe('and line wrapping', () => {
        it('shows the correct line number', () => {
          const view = render(
            <TestMarkdownRenderer
              extensions={[new HighlightedCodeMarkdownExtension()]}
              content={'```javascript=100! \nlet x = 0\n```'}
            />
          )
          expect(view.container).toMatchSnapshot()
        })

        it('shows the correct line number and continues in another codeblock', () => {
          const view = render(
            <TestMarkdownRenderer
              extensions={[new HighlightedCodeMarkdownExtension()]}
              content={'```javascript=100! \nlet x = 0\nlet y = 1\n```\n\n```javascript=+\nlet y = 2\n```\n'}
            />
          )
          expect(view.container).toMatchSnapshot()
        })
      })
    })
  })
})
