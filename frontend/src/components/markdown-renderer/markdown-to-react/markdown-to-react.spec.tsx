/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownToReact } from './markdown-to-react'
import { TestMarkdownRendererExtension } from './test-utils/test-markdown-renderer-extension'
import { render } from '@testing-library/react'

describe('markdown to react', () => {
  it('can render markdown with newlines as line breaks', () => {
    const view = render(
      <MarkdownToReact
        markdownContentLines={['# This is a headline', 'This is content', 'This Too']}
        allowHtml={false}
        newlinesAreBreaks={true}
        markdownRenderExtensions={[]}></MarkdownToReact>
    )
    expect(view.container).toMatchSnapshot()
  })

  it("won't render markdown with newlines as line breaks if forbidden", () => {
    const view = render(
      <MarkdownToReact
        markdownContentLines={['# This is a headline', 'This is content', 'This Too']}
        allowHtml={false}
        newlinesAreBreaks={false}
        markdownRenderExtensions={[]}></MarkdownToReact>
    )
    expect(view.container).toMatchSnapshot()
  })

  it('can render html if allowed', () => {
    const view = render(
      <MarkdownToReact
        markdownContentLines={['<span>test</span>']}
        markdownRenderExtensions={[]}
        newlinesAreBreaks={true}
        allowHtml={true}
      />
    )
    expect(view.container).toMatchSnapshot()
  })

  it("won't render html if forbidden", () => {
    const view = render(
      <MarkdownToReact
        markdownContentLines={['<span>test</span>']}
        markdownRenderExtensions={[]}
        newlinesAreBreaks={true}
        allowHtml={false}
      />
    )
    expect(view.container).toMatchSnapshot()
  })

  it('will use markdown render extensions', () => {
    const doAfterCallback = jest.fn()

    const view = render(
      <MarkdownToReact
        markdownContentLines={['<span>test</span>']}
        markdownRenderExtensions={[new TestMarkdownRendererExtension(doAfterCallback)]}
        newlinesAreBreaks={true}
        allowHtml={false}
      />
    )
    expect(view.container).toMatchSnapshot()
    expect(doAfterCallback).toBeCalled()
  })
})
