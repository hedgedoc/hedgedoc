/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MutableRefObject } from 'react'
import { useMemo } from 'react'
import { GenericSyntaxMarkdownExtension } from '../extensions/generic-syntax-markdown-extension'
import type { LineMarkers } from '../extensions/linemarker/add-line-marker-markdown-it-plugin'
import { DebuggerMarkdownExtension } from '../extensions/debugger-markdown-extension'
import { UploadIndicatingImageFrameMarkdownExtension } from '../extensions/upload-indicating-image-frame/upload-indicating-image-frame-markdown-extension'
import { IframeCapsuleMarkdownExtension } from '../extensions/iframe-capsule/iframe-capsule-markdown-extension'
import { LinkifyFixMarkdownExtension } from '../extensions/linkify-fix/linkify-fix-markdown-extension'
import { LinkAdjustmentMarkdownExtension } from '../extensions/link-replacer/link-adjustment-markdown-extension'
import { EmojiMarkdownExtension } from '../extensions/emoji/emoji-markdown-extension'
import { LinemarkerMarkdownExtension } from '../extensions/linemarker/linemarker-markdown-extension'
import { TableOfContentsMarkdownExtension } from '../extensions/table-of-contents-markdown-extension'
import { ImagePlaceholderMarkdownExtension } from '../extensions/image-placeholder/image-placeholder-markdown-extension'
import type { MarkdownRendererExtension } from '../extensions/base/markdown-renderer-extension'
import { useExtensionEventEmitter } from './use-extension-event-emitter'
import { optionalAppExtensions } from '../../../extensions/extra-integrations/optional-app-extensions'
import { ProxyImageMarkdownExtension } from '../extensions/image/proxy-image-markdown-extension'

const optionalMarkdownRendererExtensions = optionalAppExtensions.flatMap((value) =>
  value.buildMarkdownRendererExtensions()
)

/**
 * Provides a list of {@link MarkdownRendererExtension markdown extensions} that is a combination of the common extensions and the given additional.
 *
 * @param baseUrl The base url for the {@link LinkAdjustmentMarkdownExtension}
 * @param currentLineMarkers A {@link MutableRefObject reference} to {@link LineMarkers} for the {@link LinemarkerMarkdownExtension}
 * @param additionalExtensions The additional extensions that should be included in the list
 * @return The created list of markdown extensions
 */
export const useMarkdownExtensions = (
  baseUrl: string,
  currentLineMarkers: MutableRefObject<LineMarkers[] | undefined> | undefined,
  additionalExtensions: MarkdownRendererExtension[]
): MarkdownRendererExtension[] => {
  const extensionEventEmitter = useExtensionEventEmitter()
  //replace with global list
  return useMemo(() => {
    return [
      ...optionalMarkdownRendererExtensions,
      ...additionalExtensions,
      new TableOfContentsMarkdownExtension(extensionEventEmitter),
      new LinemarkerMarkdownExtension(
        currentLineMarkers ? (lineMarkers) => (currentLineMarkers.current = lineMarkers) : undefined
      ),
      new IframeCapsuleMarkdownExtension(),
      new ImagePlaceholderMarkdownExtension(),
      new UploadIndicatingImageFrameMarkdownExtension(),
      new LinkAdjustmentMarkdownExtension(baseUrl),
      new EmojiMarkdownExtension(),
      new GenericSyntaxMarkdownExtension(),
      new LinkifyFixMarkdownExtension(),
      new DebuggerMarkdownExtension(),
      new ProxyImageMarkdownExtension()
    ]
  }, [additionalExtensions, baseUrl, currentLineMarkers, extensionEventEmitter])
}
