/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { useConvertMarkdownToReactDom } from '../hooks/use-convert-markdown-to-react-dom'
import type { MarkdownExtension } from '../markdown-extension/markdown-extension'
import { StoreProvider } from '../../../redux/store-provider'

export interface SimpleMarkdownRendererProps {
  content: string
  extensions: MarkdownExtension[]
}

export const TestMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ content, extensions }) => {
  const lines = useMemo(() => content.split('\n'), [content])
  const dom = useConvertMarkdownToReactDom(lines, extensions, true, false)

  return <StoreProvider>{dom}</StoreProvider>
}
