/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { GenericSyntaxMarkdownExtension } from '../../markdown-renderer/markdown-extension/generic-syntax-markdown-extension'
import { useConvertMarkdownToReactDom } from '../../markdown-renderer/hooks/use-convert-markdown-to-react-dom'
import { LinkifyFixMarkdownExtension } from '../../markdown-renderer/markdown-extension/linkify-fix-markdown-extension'
import { EmojiMarkdownExtension } from '../../markdown-renderer/markdown-extension/emoji/emoji-markdown-extension'
import { DebuggerMarkdownExtension } from '../../markdown-renderer/markdown-extension/debugger-markdown-extension'
import { ProxyImageMarkdownExtension } from '../../markdown-renderer/markdown-extension/image/proxy-image-markdown-extension'
import { YoutubeMarkdownExtension } from '../../markdown-renderer/markdown-extension/youtube/youtube-markdown-extension'
import { AlertMarkdownExtension } from '../../markdown-renderer/markdown-extension/alert-markdown-extension'
import { SpoilerMarkdownExtension } from '../../markdown-renderer/markdown-extension/spoiler-markdown-extension'
import { BlockquoteExtraTagMarkdownExtension } from '../../markdown-renderer/markdown-extension/blockquote/blockquote-extra-tag-markdown-extension'
import { VimeoMarkdownExtension } from '../../markdown-renderer/markdown-extension/vimeo/vimeo-markdown-extension'
import { testId } from '../../../utils/test-id'

export interface MotdRendererProps {
  content: string
}

/**
 * Reads the motd from the global application state and renders it as markdown with a subset of the usual features and without HTML support.
 */
export const MotdRenderer: React.FC<MotdRendererProps> = ({ content }) => {
  const extensions = useMemo(
    () => [
      new YoutubeMarkdownExtension(),
      new VimeoMarkdownExtension(),
      new ProxyImageMarkdownExtension(),
      new BlockquoteExtraTagMarkdownExtension(),
      new AlertMarkdownExtension(),
      new SpoilerMarkdownExtension(),
      new GenericSyntaxMarkdownExtension(),
      new LinkifyFixMarkdownExtension(),
      new EmojiMarkdownExtension(),
      new DebuggerMarkdownExtension()
    ],
    []
  )

  const lines = useMemo(() => content.split('\n'), [content])
  const dom = useConvertMarkdownToReactDom(lines, extensions, true, false)

  return (
    <div {...testId('motd-renderer')} className={'markdown-body'}>
      {dom}
    </div>
  )
}

export default MotdRenderer
