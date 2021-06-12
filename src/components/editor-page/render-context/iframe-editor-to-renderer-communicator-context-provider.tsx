/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useContext, useMemo } from 'react'
import { IframeEditorToRendererCommunicator } from '../../render-page/iframe-editor-to-renderer-communicator'

const IFrameEditorToRendererCommunicatorContext = React.createContext<IframeEditorToRendererCommunicator | undefined>(
  undefined
)

export const useIFrameEditorToRendererCommunicator: () => IframeEditorToRendererCommunicator | undefined = () =>
  useContext(IFrameEditorToRendererCommunicatorContext)

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
