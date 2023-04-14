/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { IdProps } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import * as AsciinemaFrameModule from './asciinema-frame'
import { AsciinemaMarkdownExtension } from './asciinema-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('./asciinema-frame')

describe('asciinema markdown extension', () => {
  beforeAll(async () => {
    jest
      .spyOn(AsciinemaFrameModule, 'AsciinemaFrame')
      .mockImplementation((({ id }) => (
        <span>this is a mock for the asciinema frame with id {id}</span>
      )) as React.FC<IdProps>)
    await mockI18n()
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('renders plain asciinema URLs', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new AsciinemaMarkdownExtension()]}
        content={'https://asciinema.org/a/190123709'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
