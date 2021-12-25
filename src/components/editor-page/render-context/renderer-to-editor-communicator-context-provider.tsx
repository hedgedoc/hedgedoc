/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RendererToEditorCommunicator } from '../../render-page/window-post-message-communicator/renderer-to-editor-communicator'
import { CommunicationMessageType } from '../../render-page/window-post-message-communicator/rendering-message'
import type { ApplicationState } from '../../../redux/application-state'

const RendererToEditorCommunicatorContext = createContext<RendererToEditorCommunicator | undefined>(undefined)

/**
 * Provides the {@link RendererToEditorCommunicator renderer to editor iframe communicator} that is set by a {@link RendererToEditorCommunicatorContextProvider context provider}.
 *
 * @return the received communicator
 * @throws {Error} if no communicator was received
 */
export const useRendererToEditorCommunicator: () => RendererToEditorCommunicator = () => {
  const communicatorFromContext = useContext(RendererToEditorCommunicatorContext)
  if (!communicatorFromContext) {
    throw new Error('No renderer-to-editor-iframe-communicator received. Did you forget to use the provider component?')
  }
  return communicatorFromContext
}

export const RendererToEditorCommunicatorContextProvider: React.FC = ({ children }) => {
  const editorOrigin = useSelector((state: ApplicationState) => state.config.iframeCommunication.editorOrigin)
  const communicator = useMemo<RendererToEditorCommunicator>(() => {
    const newCommunicator = new RendererToEditorCommunicator()
    newCommunicator.setMessageTarget(window.parent, editorOrigin)
    return newCommunicator
  }, [editorOrigin])

  useEffect(() => {
    const currentCommunicator = communicator
    currentCommunicator.enableCommunication()
    currentCommunicator.sendMessageToOtherSide({
      type: CommunicationMessageType.RENDERER_READY
    })
    return () => currentCommunicator?.unregisterEventListener()
  }, [communicator])

  /**
   * Provides a {@link RendererToEditorCommunicator renderer to editor communicator} for the child components via Context.
   */
  return (
    <RendererToEditorCommunicatorContext.Provider value={communicator}>
      {children}
    </RendererToEditorCommunicatorContext.Provider>
  )
}
