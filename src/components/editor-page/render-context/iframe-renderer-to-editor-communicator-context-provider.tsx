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

export const useIFrameRendererToEditorCommunicator: () => IframeRendererToEditorCommunicator | undefined = () =>
  useContext(IFrameRendererToEditorCommunicatorContext)

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
