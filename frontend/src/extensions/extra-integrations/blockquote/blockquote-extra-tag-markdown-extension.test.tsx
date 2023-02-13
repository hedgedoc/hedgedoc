/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

describe('blockquote extra tag', () => {
  ;[
    '[color=white]',
    '[color=#dfe]',
    '[color=notarealcolor]',
    '[color=#abcdef]',
    '[color=]',
    '[name=giowehg]',
    '[name=]',
    '[time=tomorrow]',
    '[time=]',
    '[key]',
    '[key=]',
    '[=value]',
    '> [color=#f00] text'
  ].forEach((content) => {
    it(`renders the tag "${content}" correctly`, () => {
      const view = render(
        <TestMarkdownRenderer extensions={[new BlockquoteExtraTagMarkdownExtension()]} content={content} />
      )
      expect(view.container).toMatchSnapshot()
    })
  })
})
