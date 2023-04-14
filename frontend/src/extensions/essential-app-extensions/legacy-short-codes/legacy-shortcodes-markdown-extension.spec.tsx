/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { LegacyShortcodesMarkdownExtension } from './legacy-shortcodes-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

describe('Legacy shortcodes markdown extension', () => {
  it('transforms a pdf short code into an URL', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new LegacyShortcodesMarkdownExtension()]}
        content={'{%pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf %}'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
  it('transforms a slideshare short code into an URL', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new LegacyShortcodesMarkdownExtension()]}
        content={'{%slideshare example/123456789 %}'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
  it('transforms a speakerdeck short code into an URL', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new LegacyShortcodesMarkdownExtension()]}
        content={'{%speakerdeck example/123456789 %}'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
