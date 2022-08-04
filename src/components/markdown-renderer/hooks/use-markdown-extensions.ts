/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MutableRefObject } from 'react'
import { useMemo, useRef } from 'react'
import { TableOfContentsMarkdownExtension } from '../markdown-extension/table-of-contents-markdown-extension'
import { VegaLiteMarkdownExtension } from '../markdown-extension/vega-lite/vega-lite-markdown-extension'
//TODO: fix dependency issues in markmap
//import { MarkmapMarkdownExtension } from '../markdown-extension/markmap/markmap-markdown-extension'
import { LinemarkerMarkdownExtension } from '../markdown-extension/linemarker/linemarker-markdown-extension'
import { GistMarkdownExtension } from '../markdown-extension/gist/gist-markdown-extension'
import { YoutubeMarkdownExtension } from '../markdown-extension/youtube/youtube-markdown-extension'
import { VimeoMarkdownExtension } from '../markdown-extension/vimeo/vimeo-markdown-extension'
import { ProxyImageMarkdownExtension } from '../markdown-extension/image/proxy-image-markdown-extension'
import { CsvTableMarkdownExtension } from '../markdown-extension/csv/csv-table-markdown-extension'
import { AbcjsMarkdownExtension } from '../markdown-extension/abcjs/abcjs-markdown-extension'
import { SequenceDiagramMarkdownExtension } from '../markdown-extension/sequence-diagram/sequence-diagram-markdown-extension'
import { FlowchartMarkdownExtension } from '../markdown-extension/flowchart/flowchart-markdown-extension'
import { MermaidMarkdownExtension } from '../markdown-extension/mermaid/mermaid-markdown-extension'
import { GraphvizMarkdownExtension } from '../markdown-extension/graphviz/graphviz-markdown-extension'
import { BlockquoteExtraTagMarkdownExtension } from '../markdown-extension/blockquote/blockquote-extra-tag-markdown-extension'
import { LinkAdjustmentMarkdownExtension } from '../markdown-extension/link-replacer/link-adjustment-markdown-extension'
import { KatexMarkdownExtension } from '../markdown-extension/katex/katex-markdown-extension'
import { TaskListMarkdownExtension } from '../markdown-extension/task-list/task-list-markdown-extension'
import { PlantumlMarkdownExtension } from '../markdown-extension/plantuml/plantuml-markdown-extension'
import { LegacyShortcodesMarkdownExtension } from '../markdown-extension/legacy-short-codes/legacy-shortcodes-markdown-extension'
import { EmojiMarkdownExtension } from '../markdown-extension/emoji/emoji-markdown-extension'
import { GenericSyntaxMarkdownExtension } from '../markdown-extension/generic-syntax-markdown-extension'
import { AlertMarkdownExtension } from '../markdown-extension/alert-markdown-extension'
import { SpoilerMarkdownExtension } from '../markdown-extension/spoiler-markdown-extension'
import { LinkifyFixMarkdownExtension } from '../markdown-extension/linkify-fix-markdown-extension'
import { HighlightedCodeMarkdownExtension } from '../markdown-extension/highlighted-fence/highlighted-code-markdown-extension'
import { DebuggerMarkdownExtension } from '../markdown-extension/debugger-markdown-extension'
import type { LineMarkers } from '../markdown-extension/linemarker/add-line-marker-markdown-it-plugin'
import type { ImageClickHandler } from '../markdown-extension/image/proxy-image-replacer'
import type { TocAst } from 'markdown-it-toc-done-right'
import type { MarkdownExtension } from '../markdown-extension/markdown-extension'
import { IframeCapsuleMarkdownExtension } from '../markdown-extension/iframe-capsule/iframe-capsule-markdown-extension'
import { ImagePlaceholderMarkdownExtension } from '../markdown-extension/image-placeholder/image-placeholder-markdown-extension'
import { UploadIndicatingImageFrameMarkdownExtension } from '../markdown-extension/upload-indicating-image-frame/upload-indicating-image-frame-markdown-extension'
import { useOnRefChange } from './use-on-ref-change'

/**
 * Provides a list of {@link MarkdownExtension markdown extensions} that is a combination of the common extensions and the given additional.
 *
 * @param baseUrl The base url for the {@link LinkAdjustmentMarkdownExtension}
 * @param currentLineMarkers A {@link MutableRefObject reference} to {@link LineMarkers} for the {@link LinemarkerMarkdownExtension}
 * @param additionalExtensions The additional extensions that should be included in the list
 * @param onTaskCheckedChange The checkbox click callback for the {@link TaskListMarkdownExtension}
 * @param onImageClick The image click callback for the {@link ProxyImageMarkdownExtension}
 * @param onTocChange The toc-changed callback for the {@link TableOfContentsMarkdownExtension}
 * @return The created list of markdown extensions
 */
export const useMarkdownExtensions = (
  baseUrl: string,
  currentLineMarkers: MutableRefObject<LineMarkers[] | undefined> | undefined,
  additionalExtensions: MarkdownExtension[],
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void,
  onImageClick?: ImageClickHandler,
  onTocChange?: (ast?: TocAst) => void
): MarkdownExtension[] => {
  const toc = useRef<TocAst | undefined>(undefined)
  useOnRefChange(toc, onTocChange)

  return useMemo(() => {
    return [
      new TableOfContentsMarkdownExtension((ast?: TocAst) => (toc.current = ast)),
      ...additionalExtensions,
      new VegaLiteMarkdownExtension(),
      // new MarkmapMarkdownExtension(),
      new LinemarkerMarkdownExtension(
        currentLineMarkers ? (lineMarkers) => (currentLineMarkers.current = lineMarkers) : undefined
      ),
      new IframeCapsuleMarkdownExtension(),
      new ImagePlaceholderMarkdownExtension(),
      new UploadIndicatingImageFrameMarkdownExtension(),
      new GistMarkdownExtension(),
      new YoutubeMarkdownExtension(),
      new VimeoMarkdownExtension(),
      new ProxyImageMarkdownExtension(onImageClick),
      new CsvTableMarkdownExtension(),
      new AbcjsMarkdownExtension(),
      new SequenceDiagramMarkdownExtension(),
      new FlowchartMarkdownExtension(),
      new MermaidMarkdownExtension(),
      new GraphvizMarkdownExtension(),
      new BlockquoteExtraTagMarkdownExtension(),
      new LinkAdjustmentMarkdownExtension(baseUrl),
      new KatexMarkdownExtension(),
      new TaskListMarkdownExtension(onTaskCheckedChange),
      new PlantumlMarkdownExtension(),
      new LegacyShortcodesMarkdownExtension(),
      new EmojiMarkdownExtension(),
      new GenericSyntaxMarkdownExtension(),
      new AlertMarkdownExtension(),
      new SpoilerMarkdownExtension(),
      new LinkifyFixMarkdownExtension(),
      new HighlightedCodeMarkdownExtension(),
      new DebuggerMarkdownExtension()
    ]
  }, [additionalExtensions, baseUrl, currentLineMarkers, onImageClick, onTaskCheckedChange])
}
