/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../test-utils/mock-i18n'
import { TestMarkdownRenderer } from '../../test-utils/test-markdown-renderer'
import { EmojiMarkdownExtension } from './emoji-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

describe('Emoji Markdown Extension', () => {
  beforeAll(async () => {
    await mockI18n()
  })

  afterAll(() => {
    jest.resetModules()
    jest.restoreAllMocks()
  })

  it('renders an emoji code', () => {
    const view = render(<TestMarkdownRenderer extensions={[new EmojiMarkdownExtension()]} content={':smile:'} />)
    expect(view.container).toMatchSnapshot()
  })

  it('renders a skin tone code', () => {
    const view = render(<TestMarkdownRenderer extensions={[new EmojiMarkdownExtension()]} content={':skin-tone-3:'} />)
    expect(view.container).toMatchSnapshot()
  })
})
