/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { useBaseUrl } from '../../../../../hooks/common/use-base-url'
import { isMockMode } from '../../../../../utils/test-modes'
import { useMemo } from 'react'

const LOCAL_FALLBACK_URL = 'ws://localhost:8080/realtime/'

/**
 * Provides the URL for the realtime endpoint.
 */
export const useWebsocketUrl = (): URL | undefined => {
  const noteId = useApplicationState((state) => state.noteDetails.id)
  const baseUrl = useBaseUrl()

  const websocketUrl = useMemo(() => {
    if (isMockMode) {
      return LOCAL_FALLBACK_URL
    }
    try {
      const backendBaseUrlParsed = new URL(baseUrl, window.location.toString())
      backendBaseUrlParsed.protocol = backendBaseUrlParsed.protocol === 'https:' ? 'wss:' : 'ws:'
      backendBaseUrlParsed.pathname += 'realtime'
      return backendBaseUrlParsed.toString()
    } catch (e) {
      console.error(e)
      return LOCAL_FALLBACK_URL
    }
  }, [baseUrl])

  return useMemo(() => {
    if (noteId === '') {
      return
    }
    const url = new URL(websocketUrl)
    url.search = `?noteId=${noteId}`
    return url
  }, [noteId, websocketUrl])
}
