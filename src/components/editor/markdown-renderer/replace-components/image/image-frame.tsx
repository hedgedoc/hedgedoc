import React from 'react'

export const ImageFrame: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({alt, ...props}) => {
  return (
    <img alt={alt} {...props}/>
  )
}
