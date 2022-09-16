/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setMotd } from '../../../redux/motd/methods'
import { Logger } from '../../../utils/logger'
import { defaultConfig } from '../../../api/common/default-config'

export const MOTD_LOCAL_STORAGE_KEY = 'motd.lastModified'
const log = new Logger('Motd')

/**
 * Fetches the current motd from the backend and sets the content in the global application state.
 * If the motd hasn't changed since the last time then the global application state won't be changed.
 * To check if the motd has changed the "last modified" header from the request
 * will be compared to the saved value from the browser's local storage.
 * @return A promise that gets resolved if the motd was fetched successfully.
 */
export const fetchMotd = async (): Promise<void> => {
  const cachedLastModified = window.localStorage.getItem(MOTD_LOCAL_STORAGE_KEY)
  const motdUrl = `public/motd.md`

  if (cachedLastModified) {
    const response = await fetch(motdUrl, {
      ...defaultConfig,
      method: 'HEAD'
    })
    if (response.status !== 200) {
      return
    }
    const lastModified = response.headers.get('Last-Modified') || response.headers.get('etag')
    if (lastModified === cachedLastModified) {
      return
    }
  }

  const response = await fetch(motdUrl, {
    ...defaultConfig
  })

  if (response.status !== 200) {
    return
  }

  const lastModified = response.headers.get('Last-Modified') || response.headers.get('etag')
  if (!lastModified) {
    log.warn("'Last-Modified' or 'Etag' not found for motd.md!")
  }

  const motdText = await response.text()
  setMotd(motdText, lastModified)
}
