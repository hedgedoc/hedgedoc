/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isMockMode } from '../../utils/test-modes'
import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'

export interface ImageProxyResponse {
  src: string
}

export const getProxiedUrl = async (imageUrl: string): Promise<ImageProxyResponse> => {
  const response = await fetch(getApiUrl() + 'media/proxy', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      src: imageUrl
    })
  })
  expectResponseCode(response)
  return (await response.json()) as Promise<ImageProxyResponse>
}

export interface UploadedMedia {
  link: string
}

export const uploadFile = async (noteId: string, media: Blob): Promise<UploadedMedia> => {
  const response = await fetch(`${getApiUrl()}media/upload${isMockMode() ? '-post' : ''}`, {
    ...defaultFetchConfig,
    headers: {
      'Content-Type': media.type,
      'HedgeDoc-Note': noteId
    },
    method: isMockMode() ? 'GET' : 'POST',
    body: isMockMode() ? undefined : media
  })
  expectResponseCode(response, isMockMode() ? 200 : 201)
  return (await response.json()) as Promise<UploadedMedia>
}
