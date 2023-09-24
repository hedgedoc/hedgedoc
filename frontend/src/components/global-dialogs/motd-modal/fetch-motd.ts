/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defaultConfig } from '../../../api/common/default-config'
import { Logger } from '@hedgedoc/commons'

export const MOTD_LOCAL_STORAGE_KEY = 'motd.lastModified'
const log = new Logger('Motd')

export interface MotdApiResponse {
  motdText: string
  lastModified: string | null
}

/**
 * Fetches the current motd from the backend and sets the content in the global application state.
 * If the motd hasn't changed since the last time then the global application state won't be changed.
 * To check if the motd has changed the "last modified" header from the request
 * will be compared to the saved value from the browser's local storage.
 * @return A promise that gets resolved if the motd was fetched successfully.
 */
export const fetchMotd = async (): Promise<MotdApiResponse | undefined> => {
  const cachedLastModified = window.localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)
  const motdUrl = `/public/motd.md`

  if (cachedLastModified) {
    const response = await fetch(motdUrl, {
      ...defaultConfig,
      method: 'HEAD'
    })
    if (response.status !== 200) {
      return undefined
    }
    const lastModified = response.headers.get('Last-Modified') || response.headers.get('etag')
    if (lastModified === cachedLastModified) {
      return undefined
    }
  }

  const response = await fetch(motdUrl, {
    ...defaultConfig
  })

  if (response.status !== 200) {
    return undefined
  }

  const lastModified = response.headers.get('Last-Modified') || response.headers.get('etag')
  if (!lastModified) {
    log.warn("'Last-Modified' or 'Etag' not found for motd.md!")
  }

  return { motdText: await response.text(), lastModified }
}
