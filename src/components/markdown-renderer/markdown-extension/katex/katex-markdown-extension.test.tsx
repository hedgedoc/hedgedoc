/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react'
import { KatexMarkdownExtension } from './katex-markdown-extension'
import { TestMarkdownRenderer } from '../../test-utils/test-markdown-renderer'
import { Suspense } from 'react'
import type { KatexOptions } from 'katex'
import { default as KatexDefault } from 'katex'

jest.mock('katex')

describe('KaTeX markdown extensions', () => {
  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  beforeEach(() => {
    jest.spyOn(KatexDefault, 'renderToString').mockImplementation(
      (tex: string, options?: KatexOptions) => `<span>This is a mock for lib katex with this parameters:</span>
<ul>
  <li>tex: ${tex}</li>
  <li>block: ${String(options?.displayMode)}</li>
</ul>`
    )
  })

  it('renders a valid inline LaTeX expression', async () => {
    const view = render(
      <Suspense fallback={null}>
        <TestMarkdownRenderer extensions={[new KatexMarkdownExtension()]} content={'$\\alpha$'} />
      </Suspense>
    )
    expect(await screen.findByTestId('katex-inline')).toBeInTheDocument()
    expect(view.container).toMatchSnapshot()
  })

  it('renders a valid block LaTeX expression in a single line', async () => {
    const view = render(
      <Suspense fallback={null}>
        <TestMarkdownRenderer extensions={[new KatexMarkdownExtension()]} content={'$$$\\alpha$$$'} />
      </Suspense>
    )
    expect(await screen.findByTestId('katex-block')).toBeInTheDocument()
    expect(view.container).toMatchSnapshot()
  })

  it('renders a valid block LaTeX expression in multi line', async () => {
    const view = render(
      <Suspense fallback={null}>
        <TestMarkdownRenderer extensions={[new KatexMarkdownExtension()]} content={'$$$\n\\alpha\n$$$'} />
      </Suspense>
    )
    expect(await screen.findByTestId('katex-block')).toBeInTheDocument()
    expect(view.container).toMatchSnapshot()
  })

  it('renders an error message for an invalid LaTeX expression', async () => {
    jest.spyOn(KatexDefault, 'renderToString').mockImplementation(() => {
      throw new Error('mocked parseerror')
    })

    const view = render(
      <Suspense fallback={null}>
        <TestMarkdownRenderer extensions={[new KatexMarkdownExtension()]} content={'$\\a$'} />
      </Suspense>
    )
    expect(await screen.findByTestId('katex-inline')).toBeInTheDocument()
    expect(view.container).toMatchSnapshot()
  })
})
