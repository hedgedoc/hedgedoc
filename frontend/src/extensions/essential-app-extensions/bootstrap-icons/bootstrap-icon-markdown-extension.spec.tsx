/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { BootstrapIconMarkdownExtension } from './bootstrap-icon-markdown-extension'
import { render, screen } from '@testing-library/react'
import React from 'react'

describe('bootstrap icon markdown extension', () => {
  it('renders correct icon', async () => {
    const view = render(
      <TestMarkdownRenderer extensions={[new BootstrapIconMarkdownExtension()]} content={':bi-alarm:'} />
    )
    await screen.findByTestId('lazy-bootstrap-icon-alarm')
    expect(view.container).toMatchSnapshot()
  })

  it("doesn't render missing icon", () => {
    const view = render(<TestMarkdownRenderer extensions={[new BootstrapIconMarkdownExtension()]} content={':bi-:'} />)
    expect(view.container).toMatchSnapshot()
  })

  it("doesn't render invalid icon", () => {
    const view = render(
      <TestMarkdownRenderer extensions={[new BootstrapIconMarkdownExtension()]} content={':bi-INVALIDICONNAME:'} />
    )
    expect(view.container).toMatchSnapshot()
  })
})
