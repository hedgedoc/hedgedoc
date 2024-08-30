/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getProxiedUrl } from '../../../../api/media'
import { Logger } from '../../../../utils/logger'
import { useFrontendConfig } from '../../../common/frontend-config-context/use-frontend-config'
import React, { useEffect, useState } from 'react'

const log = new Logger('ProxyImageFrame')

/**
 * Renders an image using the image proxy.
 *
 * @param src The image source
 * @param title The title of the image
 * @param alt The alt text of the image
 * @param props Additional props directly given to the image
 */
export const ProxyImageFrame: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, title, alt, ...props }) => {
  const [imageUrl, setImageUrl] = useState('')
  const imageProxyEnabled = useFrontendConfig().useImageProxy

  useEffect(() => {
    if (!imageProxyEnabled || !src) {
      return
    }
    getProxiedUrl(src)
      .then((proxyResponse) => setImageUrl(proxyResponse.url))
      .catch((err) => log.error(err))
  }, [imageProxyEnabled, src])

  // The next image processor works with a whitelist of origins. Therefore, we can't use it for general images.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imageProxyEnabled ? imageUrl : (src ?? '')} title={title ?? alt ?? ''} alt={alt} {...props} />
}
