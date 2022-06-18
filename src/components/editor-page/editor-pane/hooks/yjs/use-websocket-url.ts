/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { backendUrl } from '../../../../../utils/backend-url'
import { isMockMode } from '../../../../../utils/test-modes'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'

const LOCAL_FALLBACK_URL = 'ws://localhost:8080/realtime/'

/**
 * Provides the URL for the realtime endpoint.
 */
export const useWebsocketUrl = (): URL => {
  const noteId = useApplicationState((state) => state.noteDetails.id)

  const baseUrl = useMemo(() => {
    if (isMockMode) {
      return process.env.NEXT_PUBLIC_REALTIME_URL ?? LOCAL_FALLBACK_URL
    }
    try {
      const backendBaseUrlParsed = new URL(backendUrl)
      backendBaseUrlParsed.protocol = backendBaseUrlParsed.protocol === 'https:' ? 'wss:' : 'ws:'
      backendBaseUrlParsed.pathname += 'realtime'
      return backendBaseUrlParsed.toString()
    } catch (e) {
      console.error(e)
      return LOCAL_FALLBACK_URL
    }
  }, [])

  return useMemo(() => {
    const url = new URL(baseUrl)
    url.search = `?noteId=${noteId}`
    return url
  }, [baseUrl, noteId])
}
