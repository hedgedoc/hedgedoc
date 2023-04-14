/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { StoreProvider } from '../../../redux/store-provider'
import type { MarkdownRendererExtension } from '../extensions/_base-classes/markdown-renderer-extension'
import { MarkdownToReact } from '../markdown-to-react/markdown-to-react'
import React, { useMemo } from 'react'

export interface SimpleMarkdownRendererProps {
  content: string
  extensions: MarkdownRendererExtension[]
}

/**
 * A markdown renderer for tests.
 *
 * @param content The content to be rendered.
 * @param extensions The {@link MarkdownRendererExtension MarkdownExtensions} to use for rendering.
 */
export const TestMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ content, extensions }) => {
  const lines = useMemo(() => content.split('\n'), [content])
  return (
    <StoreProvider>
      <MarkdownToReact
        markdownContentLines={lines}
        markdownRenderExtensions={extensions}
        newlinesAreBreaks={true}
        allowHtml={false}
      />
    </StoreProvider>
  )
}
