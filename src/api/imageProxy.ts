import { ImageProxyResponse } from '../components/editor/markdown-renderer/replace-components/image/types'
import { expectResponseCode, getApiUrl } from '../utils/apiUtils'
import { defaultFetchConfig } from './default'

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
