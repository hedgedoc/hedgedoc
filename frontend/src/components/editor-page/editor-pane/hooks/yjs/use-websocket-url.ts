/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { useBaseUrl } from '../../../../../hooks/common/use-base-url'
import { useMemo } from 'react'
import { Logger } from '../../../../../utils/logger'

const LOCAL_FALLBACK_URL = 'ws://localhost:8080/realtime/'

const logger = new Logger('WebsocketUrl')

/**
 * Provides the URL for the realtime endpoint.
 */
export const useWebsocketUrl = (): URL | null => {
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const baseUrl = useBaseUrl()

  const websocketUrl = useMemo(() => {
    try {
      const backendBaseUrlParsed = new URL(baseUrl)
      backendBaseUrlParsed.protocol = backendBaseUrlParsed.protocol === 'https:' ? 'wss:' : 'ws:'
      backendBaseUrlParsed.pathname += 'realtime'
      return backendBaseUrlParsed.toString()
    } catch (e) {
      logger.error(e)
      return LOCAL_FALLBACK_URL
    }
  }, [baseUrl])

  return useMemo(() => {
    if (noteId === '' || noteId === undefined) {
      return null
    }
    const url = new URL(websocketUrl)
    url.search = `?noteId=${noteId}`
    return url
  }, [noteId, websocketUrl])
}
