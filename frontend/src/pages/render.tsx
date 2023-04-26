/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RendererToEditorCommunicatorContextProvider } from '../components/editor-page/render-context/renderer-to-editor-communicator-context-provider'
import { RenderPageContent } from '../components/render-page/render-page-content'
import { useApplyDarkModeStyle } from '../hooks/dark-mode/use-apply-dark-mode-style'
import type { NextPage } from 'next'
import React from 'react'

/**
 * Renders the actual markdown renderer that receives the content and metadata via iframe communication.
 */
export const RenderPage: NextPage = () => {
  useApplyDarkModeStyle()

  return (
    <RendererToEditorCommunicatorContextProvider>
      <RenderPageContent />
    </RendererToEditorCommunicatorContextProvider>
  )
}

export default RenderPage
