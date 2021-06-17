/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { IframeRendererToEditorCommunicator } from '../../render-page/iframe-renderer-to-editor-communicator'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'

const IFrameRendererToEditorCommunicatorContext = createContext<IframeRendererToEditorCommunicator | undefined>(
  undefined
)

/**
 * Provides the {@link IframeRendererToEditorCommunicator renderer to editor iframe communicator} that is set by a {@link IframeRendererToEditorCommunicatorContextProvider context provider}.
 *
 * @return the received communicator
 * @throws Error if no communicator was received
 */
export const useIFrameRendererToEditorCommunicator: () => IframeRendererToEditorCommunicator = () => {
  const communicatorFromContext = useContext(IFrameRendererToEditorCommunicatorContext)
  if (!communicatorFromContext) {
    throw new Error('No renderer-to-editor-iframe-communicator received. Did you forget to use the provider component?')
  }
  return communicatorFromContext
}

export const IframeRendererToEditorCommunicatorContextProvider: React.FC = ({ children }) => {
  const editorOrigin = useSelector((state: ApplicationState) => state.config.iframeCommunication.editorOrigin)
  const currentIFrameCommunicator = useMemo<IframeRendererToEditorCommunicator>(() => {
    const newCommunicator = new IframeRendererToEditorCommunicator()
    newCommunicator.setOtherSide(window.parent, editorOrigin)
    return newCommunicator
  }, [editorOrigin])

  useEffect(() => {
    const currentIFrame = currentIFrameCommunicator
    currentIFrame?.sendRendererReady()
    return () => currentIFrame?.unregisterEventListener()
  }, [currentIFrameCommunicator])

  return (
    <IFrameRendererToEditorCommunicatorContext.Provider value={currentIFrameCommunicator}>
      {children}
    </IFrameRendererToEditorCommunicatorContext.Provider>
  )
}
