/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { IdProps } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import * as YouTubeFrameModule from './youtube-frame'
import { YoutubeMarkdownExtension } from './youtube-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vitest, beforeAll, afterAll } from 'vitest'
import { vi } from 'vitest'

vi.mock('./youtube-frame')

describe('youtube markdown extension', () => {
  beforeAll(async () => {
    vi
      .spyOn(YouTubeFrameModule, 'YouTubeFrame')
      .mockImplementation((({ id }) => (
        <span>this is a mock for the youtube frame with id {id}</span>
      )) as React.FC<IdProps>)
    await mockI18n()
  })

  afterAll(() => {
    vitest.resetAllMocks()
    vitest.resetModules()
  })

  it('renders plain youtube URLs', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new YoutubeMarkdownExtension()]}
        content={'https://www.youtube.com/watch?v=XDnhKh5V5XQ'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })

  it('renders legacy youtube syntax', () => {
    const view = render(
      <TestMarkdownRenderer extensions={[new YoutubeMarkdownExtension()]} content={'{%youtube XDnhKh5V5XQ %}'} />
    )
    expect(view.container).toMatchSnapshot()
  })

  it("doesn't render invalid youtube ids in short code syntax", () => {
    const view = render(
      <TestMarkdownRenderer extensions={[new YoutubeMarkdownExtension()]} content={'{%youtube a %}'} />
    )
    expect(view.container).toMatchSnapshot()
  })
})
