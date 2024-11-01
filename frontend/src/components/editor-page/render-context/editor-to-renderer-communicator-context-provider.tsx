'use client'

/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ORIGIN, useBaseUrl } from '../../../hooks/common/use-base-url'
import { EditorToRendererCommunicator } from '../../render-page/window-post-message-communicator/editor-to-renderer-communicator'
import type { PropsWithChildren } from 'react'
import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import { Logger } from '../../../utils/logger'

const logger = new Logger('EditorToRendererCommunicator')
const EditorToRendererCommunicatorContext = createContext<EditorToRendererCommunicator | undefined>(undefined)

/**
 * Provides the {@link EditorToRendererCommunicator editor to renderer iframe communicator} that is set by a {@link EditorToRendererCommunicatorContextProvider context provider}.
 *
 * @return the received communicator
 * @throws {Error} if no communicator was received
 */
export const useEditorToRendererCommunicator = (): EditorToRendererCommunicator | undefined => {
  const communicatorFromContext = useContext(EditorToRendererCommunicatorContext)
  if (!communicatorFromContext) {
    logger.error('No editor-to-renderer-iframe-communicator received. Did you forget to use the provider component?')
    return undefined
  }
  return communicatorFromContext
}

/**
 * Provides a {@link EditorToRendererCommunicator editor to renderer communicator} for the child components via Context.
 */
export const EditorToRendererCommunicatorContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rendererUrl = useBaseUrl(ORIGIN.RENDERER)

  const communicator = useMemo<EditorToRendererCommunicator>(
    () => new EditorToRendererCommunicator(uuid(), new URL(rendererUrl).origin),
    [rendererUrl]
  )

  useEffect(() => {
    const currentCommunicator = communicator
    currentCommunicator.registerEventListener()
    return () => {
      currentCommunicator.unregisterEventListener()
    }
  }, [communicator])

  return (
    <EditorToRendererCommunicatorContext.Provider value={communicator}>
      {children}
    </EditorToRendererCommunicatorContext.Provider>
  )
}
