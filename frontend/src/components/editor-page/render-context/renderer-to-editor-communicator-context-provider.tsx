'use client'

/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ORIGIN, useBaseUrl } from '../../../hooks/common/use-base-url'
import { useSingleStringUrlParameter } from '../../../hooks/common/use-single-string-url-parameter'
import { RendererToEditorCommunicator } from '../../render-page/window-post-message-communicator/renderer-to-editor-communicator'
import { CommunicationMessageType } from '../../render-page/window-post-message-communicator/rendering-message'
import type { PropsWithChildren } from 'react'
import React, { createContext, useContext, useEffect, useMemo } from 'react'

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

export const RendererToEditorCommunicatorContextProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const editorUrl = useBaseUrl(ORIGIN.EDITOR)
  const uuid = useSingleStringUrlParameter('uuid', undefined)
  const communicator = useMemo<RendererToEditorCommunicator>(() => {
    if (uuid === undefined) {
      throw new Error('no uuid found in url!')
    } else {
      return new RendererToEditorCommunicator(uuid, new URL(editorUrl).origin)
    }
  }, [editorUrl, uuid])

  useEffect(() => {
    const currentCommunicator = communicator

    currentCommunicator.setMessageTarget(window.parent)
    currentCommunicator.registerEventListener()
    currentCommunicator.enableCommunication()
    currentCommunicator.sendMessageToOtherSide({
      type: CommunicationMessageType.RENDERER_READY
    })
    return () => currentCommunicator?.unregisterEventListener()
  }, [communicator, editorUrl])

  /**
   * Provides a {@link RendererToEditorCommunicator renderer to editor communicator} for the child components via Context.
   */
  return (
    <RendererToEditorCommunicatorContext.Provider value={communicator}>
      {children}
    </RendererToEditorCommunicatorContext.Provider>
  )
}
