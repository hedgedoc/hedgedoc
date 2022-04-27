/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { YoutubeMarkdownExtension } from './youtube-markdown-extension'
import { render } from '@testing-library/react'
import { TestMarkdownRenderer } from '../../test-utils/test-markdown-renderer'
import * as YouTubeFrameModule from './youtube-frame'
import React from 'react'
import type { IdProps } from '../../replace-components/custom-tag-with-id-component-replacer'
import { mockI18n } from '../../test-utils/mock-i18n'
import MarkdownIt from 'markdown-it'
import * as replaceLegacyYoutubeShortCodeMarkdownItPluginModule from './replace-legacy-youtube-short-code'
import * as replaceYouTubeLinkMarkdownItPluginModule from './replace-youtube-link'

describe('youtube markdown extension', () => {
  const replaceYouTubeLinkMarkdownItPluginSpy = jest.spyOn(
    replaceYouTubeLinkMarkdownItPluginModule,
    'replaceYouTubeLinkMarkdownItPlugin'
  )
  const replaceLegacyYoutubeShortCodeMarkdownItPluginSpy = jest.spyOn(
    replaceLegacyYoutubeShortCodeMarkdownItPluginModule,
    'replaceLegacyYoutubeShortCodeMarkdownItPlugin'
  )

  beforeAll(async () => {
    jest
      .spyOn(YouTubeFrameModule, 'YouTubeFrame')
      .mockImplementation((({ id }) => (
        <span>this is a mock for the youtube frame with id {id}</span>
      )) as React.FC<IdProps>)
    await mockI18n()
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('renders plain youtube URLs', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new YoutubeMarkdownExtension()]}
        content={'https://www.youtube.com/watch?v=XDnhKh5V5XQ'}
      />
    )
    expect(replaceYouTubeLinkMarkdownItPluginSpy).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(replaceLegacyYoutubeShortCodeMarkdownItPluginSpy).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(view.container).toMatchSnapshot()
  })

  it('renders legacy youtube syntax', () => {
    const view = render(
      <TestMarkdownRenderer extensions={[new YoutubeMarkdownExtension()]} content={'{%youtube XDnhKh5V5XQ %}'} />
    )
    expect(replaceYouTubeLinkMarkdownItPluginSpy).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(replaceLegacyYoutubeShortCodeMarkdownItPluginSpy).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(view.container).toMatchSnapshot()
  })

  it("doesn't render invalid youtube ids in short code syntax", () => {
    const view = render(
      <TestMarkdownRenderer extensions={[new YoutubeMarkdownExtension()]} content={'{%youtube a %}'} />
    )
    expect(replaceYouTubeLinkMarkdownItPluginSpy).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(replaceLegacyYoutubeShortCodeMarkdownItPluginSpy).toHaveBeenCalledWith(expect.any(MarkdownIt))
    expect(view.container).toMatchSnapshot()
  })
})
