/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { KatexMarkdownExtension } from './katex-markdown-extension'
import { render, screen } from '@testing-library/react'
import type { KatexOptions } from 'katex'
import { default as KatexDefault } from 'katex'
import type { PropsWithChildren } from 'react'
import React, { Suspense } from 'react'

jest.mock('katex')
jest.mock('../../../components/common/application-error-alert/application-error-alert', () => ({
  ApplicationErrorAlert: ({ children, ...props }: PropsWithChildren) => (
    <div>
      <h3>This is a mock for ApplicationErrorAlert.</h3>
      Props: <code>{JSON.stringify(props)}</code>
      Children:
      <div>{children}</div>
    </div>
  )
}))

describe('KaTeX markdown extensions', () => {
  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  beforeEach(() => {
    jest.spyOn(KatexDefault, 'renderToString').mockImplementation(
      (tex: string, options?: KatexOptions) => `<span>This is a mock for lib katex with this parameters:</span>
<span>
  <span>tex: ${tex}</span>
  <span>block: ${String(options?.displayMode)}</span>
</span>`
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
