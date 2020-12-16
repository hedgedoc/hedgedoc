/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ImageProxyResponse } from '../../components/markdown-renderer/replace-components/image/types'
import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'

export const getProxiedUrl = async (imageUrl: string): Promise<ImageProxyResponse> => {
  const response = await fetch(getApiUrl() + '/media/proxy', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      src: imageUrl
    })
  })
  expectResponseCode(response)
  return await response.json() as Promise<ImageProxyResponse>
}

export interface UploadedMedia {
  link: string
}

export const uploadFile = async (noteId: string, contentType: string, media: Blob): Promise<UploadedMedia> => {
  const response = await fetch(getApiUrl() + '/media/upload', {
    ...defaultFetchConfig,
    headers: {
      'Content-Type': contentType,
      'HedgeDoc-Note': noteId
    },
    method: 'POST',
    body: media
  })
  expectResponseCode(response, 201)
  return await response.json() as Promise<UploadedMedia>
}
