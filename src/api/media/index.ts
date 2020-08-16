import { ImageProxyResponse } from '../../components/markdown-renderer/replace-components/image/types'
import { expectResponseCode, getApiUrl, defaultFetchConfig } from '../utils'

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
