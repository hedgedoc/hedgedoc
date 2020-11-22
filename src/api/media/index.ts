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
