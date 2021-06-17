/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { createContext, useContext, useMemo } from 'react'
import { IframeEditorToRendererCommunicator } from '../../render-page/iframe-editor-to-renderer-communicator'

const IFrameEditorToRendererCommunicatorContext = createContext<IframeEditorToRendererCommunicator | undefined>(
  undefined
)

/**
 * Provides the {@link IframeEditorToRendererCommunicator editor to renderer iframe communicator} that is set by a {@link IframeEditorToRendererCommunicatorContextProvider context provider}.
 *
 * @return the received communicator
 * @throws Error if no communicator was received
 */
export const useIFrameEditorToRendererCommunicator: () => IframeEditorToRendererCommunicator = () => {
  const communicatorFromContext = useContext(IFrameEditorToRendererCommunicatorContext)
  if (!communicatorFromContext) {
    throw new Error('No editor-to-renderer-iframe-communicator received. Did you forget to use the provider component?')
  }
  return communicatorFromContext
}

export const IframeEditorToRendererCommunicatorContextProvider: React.FC = ({ children }) => {
  const currentIFrameCommunicator = useMemo<IframeEditorToRendererCommunicator>(
    () => new IframeEditorToRendererCommunicator(),
    []
  )

  return (
    <IFrameEditorToRendererCommunicatorContext.Provider value={currentIFrameCommunicator}>
      {children}
    </IFrameEditorToRendererCommunicatorContext.Provider>
  )
}
