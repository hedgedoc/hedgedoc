/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { IframeMarkdownRenderer } from './iframe-markdown-renderer'
import { IframeRendererToEditorCommunicatorContextProvider } from '../editor-page/render-context/iframe-renderer-to-editor-communicator-context-provider'

export const RenderPage: React.FC = () => {
  useApplyDarkMode()

  return (
    <IframeRendererToEditorCommunicatorContextProvider>
      <IframeMarkdownRenderer />
    </IframeRendererToEditorCommunicatorContextProvider>
  )
}

export default RenderPage
