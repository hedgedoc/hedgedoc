/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import HighlightedCode from './highlighted-code'
import { render, screen } from '@testing-library/react'

describe('Highlighted Code', () => {
  beforeAll(() => mockI18n())

  it('renders plain text', async () => {
    render(<HighlightedCode code={'a\nb\nc'} startLineNumber={1} language={''} wrapLines={false}></HighlightedCode>)
    expect(await screen.findByTestId('code-highlighter')).toMatchSnapshot()
  })

  it('highlights code', async () => {
    render(
      <HighlightedCode
        code={'const a = 1'}
        language={'typescript'}
        startLineNumber={1}
        wrapLines={false}></HighlightedCode>
    )
    expect(await screen.findByTestId('code-highlighter')).toMatchSnapshot()
  })

  it('wraps code', async () => {
    render(<HighlightedCode code={'const a = 1'} wrapLines={true} startLineNumber={1} language={''}></HighlightedCode>)
    expect(await screen.findByTestId('code-highlighter')).toMatchSnapshot()
  })

  it('starts with a specific line', async () => {
    render(
      <HighlightedCode code={'const a = 1'} startLineNumber={100} language={''} wrapLines={true}></HighlightedCode>
    )
    expect(await screen.findByTestId('code-highlighter')).toMatchSnapshot()
  })

  it('can hide the line numbers', async () => {
    render(
      <HighlightedCode
        code={'const a = 1'}
        startLineNumber={undefined}
        language={''}
        wrapLines={true}></HighlightedCode>
    )
    expect(await screen.findByTestId('code-highlighter')).toMatchSnapshot()
  })
})
