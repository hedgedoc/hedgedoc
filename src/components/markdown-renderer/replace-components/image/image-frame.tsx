import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getProxiedUrl } from '../../../../api/media'
import { ApplicationState } from '../../../../redux'

export const ImageFrame: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ alt, src, title, ...props }) => {
  const [imageUrl, setImageUrl] = useState('')
  const imageProxyEnabled = useSelector((state: ApplicationState) => state.config.useImageProxy)

  useEffect(() => {
    if (!imageProxyEnabled || !src) {
      return
    }
    getProxiedUrl(src)
      .then(proxyResponse => setImageUrl(proxyResponse.src))
      .catch(err => console.error(err))
  }, [imageProxyEnabled, src])

  if (imageProxyEnabled) {
    return (
      <img alt={alt} src={imageUrl} title={title ?? ''} {...props}/>
    )
  }

  return (
    <img alt={alt} src={src ?? ''} title={title ?? ''} {...props}/>
  )
}
