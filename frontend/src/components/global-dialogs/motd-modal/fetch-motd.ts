/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defaultConfig } from '../../../api/common/default-config'
import { isBuildTime } from '../../../utils/test-modes'

export interface MotdApiResponse {
  motdText: string
  lastModified: string
}

/**
 * Fetches the current motd from the backend and sets the content in the global application state.
 * If the motd hasn't changed since the last time then the global application state won't be changed.
 * To check if the motd has changed the "last modified" header from the request
 * will be compared to the saved value from the browser's local storage.
 * @return A promise that gets resolved if the motd was fetched successfully.
 */
export const fetchMotd = async (baseUrl: string): Promise<MotdApiResponse | undefined> => {
  if (isBuildTime) {
    return
  }
  const motdUrl = `${baseUrl}public/motd.md`
  const response = await fetch(motdUrl, {
    ...defaultConfig
  })

  if (response.status !== 200) {
    return
  }

  const lastModified = response.headers.get('Last-Modified') || response.headers.get('etag')
  if (lastModified === null) {
    return
  }

  return {
    lastModified,
    motdText: await response.text()
  }
}
