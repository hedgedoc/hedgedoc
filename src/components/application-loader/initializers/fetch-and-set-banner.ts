/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setBanner } from '../../../redux/banner/methods'
import { defaultFetchConfig } from '../../../api/utils'

export const BANNER_LOCAL_STORAGE_KEY = 'banner.lastModified'

export const fetchAndSetBanner = async (customizeAssetsUrl: string): Promise<void> => {
  const cachedLastModified = window.localStorage.getItem(BANNER_LOCAL_STORAGE_KEY)
  const bannerUrl = `${customizeAssetsUrl}banner.txt`

  if (cachedLastModified) {
    const response = await fetch(bannerUrl, {
      ...defaultFetchConfig,
      method: 'HEAD'
    })
    if (response.status !== 200) {
      return
    }
    if (response.headers.get('Last-Modified') === cachedLastModified) {
      setBanner({
        lastModified: cachedLastModified,
        text: ''
      })
      return
    }
  }

  const response = await fetch(bannerUrl, {
    ...defaultFetchConfig
  })

  if (response.status !== 200) {
    return
  }

  const bannerText = await response.text()

  const lastModified = response.headers.get('Last-Modified')
  if (!lastModified) {
    console.warn("'Last-Modified' not found for banner.txt!")
  }

  setBanner({
    lastModified: lastModified,
    text: bannerText
  })
}
