/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CommunicationMessageType } from '../window-post-message-communicator/rendering-message'
import { useRendererReceiveHandler } from '../window-post-message-communicator/hooks/use-renderer-receive-handler'
import { useMemo } from 'react'
import clickShieldCss from '../../markdown-renderer/replace-components/click-shield/click-shield.module.scss'
import highlightedCodeCss from '../../common/highlighted-code/highlighted-code.module.scss'
import copyButtonCss from '../../common/copyable/copy-to-clipboard-button/style.module.scss'
import type { RendererToEditorCommunicator } from '../window-post-message-communicator/renderer-to-editor-communicator'

/**
 * Builds a hook that grabs and transforms the markdown HTML content for sending it back to the iframe host
 * for downloading. The transformations include removing click shields, interactive buttons and invalid links.
 *
 * @param communicator The iframe communicator to use for receiving events on
 */
export const useOnHtmlExportRequest = (communicator: RendererToEditorCommunicator) => {
  useRendererReceiveHandler(
    CommunicationMessageType.EXPORT_HTML_REQUEST,
    useMemo(
      () =>
        ({ noteUrl }) => {
          const documentContainer = document.querySelector('.markdown-body')
          if (!documentContainer) {
            return
          }
          const downloadElement = document.createElement('div')
          downloadElement.innerHTML = documentContainer.innerHTML
          ;[
            ...downloadElement.querySelectorAll(`.${clickShieldCss['click-shield']}`),
            ...downloadElement.querySelectorAll(`.${copyButtonCss['copy-button']}`),
            ...downloadElement.querySelectorAll(`.${highlightedCodeCss['linenumber']}`)
          ].forEach((element) => element.remove())
          console.debug('Note URL to replace: ', noteUrl)
          downloadElement.querySelectorAll('a[href]').forEach((element) => {
            const href = element.getAttribute('href')
            if (!href || !href.startsWith(noteUrl)) {
              return
            }
            element.setAttribute('href', href.replace(noteUrl, ''))
          })
          const finalHtml = downloadElement.innerHTML
          communicator.sendMessageToOtherSide({
            type: CommunicationMessageType.EXPORT_HTML_RESPONSE,
            html: finalHtml
          })
        },
      [communicator]
    )
  )
}
