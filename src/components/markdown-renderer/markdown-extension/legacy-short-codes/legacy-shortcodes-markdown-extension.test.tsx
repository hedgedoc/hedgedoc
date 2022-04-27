/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as replaceLegacyPdfShortCodeModule from './replace-legacy-pdf-short-code'
import * as replaceLegacySlideshareShortCodeModule from './replace-legacy-slideshare-short-code'
import * as replaceLegacySpeakerdeckShortCodeModule from './replace-legacy-speakerdeck-short-code'
import { render } from '@testing-library/react'
import { TestMarkdownRenderer } from '../../test-utils/test-markdown-renderer'
import React from 'react'
import { LegacyShortcodesMarkdownExtension } from './legacy-shortcodes-markdown-extension'
import MarkdownIt from 'markdown-it'

describe('Legacy shortcodes markdown extension', () => {
  const replaceLegacyPdfShortCodeMarkdownItExtensionMock = jest.spyOn(
    replaceLegacyPdfShortCodeModule,
    'legacyPdfShortCode'
  )
  const replaceLegacySlideshareShortCodeMarkdownItExtensionMock = jest.spyOn(
    replaceLegacySlideshareShortCodeModule,
    'legacySlideshareShortCode'
  )
  const replaceLegacySpeakerdeckShortCodeMarkdownItExtensionMock = jest.spyOn(
    replaceLegacySpeakerdeckShortCodeModule,
    'legacySpeakerdeckShortCode'
  )

  it('renders correctly', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new LegacyShortcodesMarkdownExtension()]}
        content={
          '{%pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf %}\n{%slideshare example/123456789 %}\n{%speakerdeck example/123456789 %}'
        }
      />
    )
    expect(replaceLegacyPdfShortCodeMarkdownItExtensionMock).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(replaceLegacySlideshareShortCodeMarkdownItExtensionMock).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(replaceLegacySpeakerdeckShortCodeMarkdownItExtensionMock).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(view.container).toMatchSnapshot()
  })
})
