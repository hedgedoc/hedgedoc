/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { allAppExtensions } from '../../../extensions/all-app-extensions'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import type { RendererType } from '../../render-page/window-post-message-communicator/rendering-message'
import type { MarkdownRendererExtension } from '../extensions/_base-classes/markdown-renderer-extension'
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
 * @param rendererType The type of the renderer that uses the extensions
 * @param additionalExtensions The additional extensions that should be included in the list
 * @return The created list of markdown extensions
 */
export const useMarkdownExtensions = (
  baseUrl: string,
  rendererType: RendererType,
  additionalExtensions: MarkdownRendererExtension[]
): MarkdownRendererExtension[] => {
  const extensionEventEmitter = useExtensionEventEmitter()
  const frontendConfig = useFrontendConfig()
  return useMemo(() => {
    if (!extensionEventEmitter) {
      throw new Error("can't build markdown render extensions without event emitter.")
    }
    return [
      ...allAppExtensions.flatMap((extension) =>
        extension.buildMarkdownRendererExtensions({
          frontendConfig: frontendConfig,
          eventEmitter: extensionEventEmitter,
          rendererType
        })
      ),
      ...additionalExtensions,
      new UploadIndicatingImageFrameMarkdownExtension(),
      new LinkAdjustmentMarkdownExtension(baseUrl),
      new LinkifyFixMarkdownExtension(),
      new DebuggerMarkdownExtension(),
      new ProxyImageMarkdownExtension()
    ]
  }, [additionalExtensions, baseUrl, extensionEventEmitter, frontendConfig, rendererType])
}
