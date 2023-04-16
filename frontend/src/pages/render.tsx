/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RendererToEditorCommunicatorContextProvider } from '../components/editor-page/render-context/renderer-to-editor-communicator-context-provider'
import { RenderPageContent } from '../components/render-page/render-page-content'
import { useApplyDarkMode } from '../hooks/common/use-apply-dark-mode'
import type { NextPage } from 'next'
import React from 'react'

/**
 * Renders the actual markdown renderer that receives the content and metadata via iframe communication.
 */
export const RenderPage: NextPage = () => {
  useApplyDarkMode()

  return (
    <RendererToEditorCommunicatorContextProvider>
      <RenderPageContent />
    </RendererToEditorCommunicatorContextProvider>
  )
}

export default RenderPage
