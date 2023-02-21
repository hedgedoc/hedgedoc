/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { optionalAppExtensions } from '../../../extensions/extra-integrations/optional-app-extensions'
import type { MarkdownRendererExtension } from '../extensions/base/markdown-renderer-extension'
import { DebuggerMarkdownExtension } from '../extensions/debugger-markdown-extension'
import { ProxyImageMarkdownExtension } from '../extensions/image/proxy-image-markdown-extension'
import { LinkAdjustmentMarkdownExtension } from '../extensions/link-replacer/link-adjustment-markdown-extension'
import { LinkifyFixMarkdownExtension } from '../extensions/linkify-fix/linkify-fix-markdown-extension'
import { UploadIndicatingImageFrameMarkdownExtension } from '../extensions/upload-indicating-image-frame/upload-indicating-image-frame-markdown-extension'
import { useExtensionEventEmitter } from './use-extension-event-emitter'
import { useMemo } from 'react'

/**
 * Provides a list of {@link MarkdownRendererExtension markdown extensions} that is a combination of the common extensions and the given additional.
 *
 * @param baseUrl The base url for the {@link LinkAdjustmentMarkdownExtension}
 * @param additionalExtensions The additional extensions that should be included in the list
 * @return The created list of markdown extensions
 */
export const useMarkdownExtensions = (
  baseUrl: string,
  additionalExtensions: MarkdownRendererExtension[]
): MarkdownRendererExtension[] => {
  const extensionEventEmitter = useExtensionEventEmitter()
  return useMemo(() => {
    return [
      ...optionalAppExtensions.flatMap((extension) => extension.buildMarkdownRendererExtensions(extensionEventEmitter)),
      ...additionalExtensions,
      new UploadIndicatingImageFrameMarkdownExtension(),
      new LinkAdjustmentMarkdownExtension(baseUrl),
      new LinkifyFixMarkdownExtension(),
      new DebuggerMarkdownExtension(),
      new ProxyImageMarkdownExtension()
    ]
  }, [additionalExtensions, baseUrl, extensionEventEmitter])
}
