import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ComponentReplacer } from '../../markdown-preview'
import { OneClickEmbedding } from '../one-click-frame/one-click-embedding'
import { getIdFromCodiMdTag } from '../video-util'
import './gist-frame.scss'
import preview from './gist-preview.png'

export interface GistFrameProps {
  id: string
}

interface resizeEvent {
  size: number
  id: string
}

const getElementReplacement:ComponentReplacer = (node, counterMap) => {
  const gistId = getIdFromCodiMdTag(node, 'gist')
  if (gistId) {
    const count = (counterMap.get(gistId) || 0) + 1
    counterMap.set(gistId, count)
    return (
      <OneClickEmbedding previewContainerClassName={'gist-frame'} key={`gist_${gistId}_${count}`} loadingImageUrl={preview} hoverIcon={'github'} tooltip={'click to load gist'}>
        <GistFrame id={gistId}/>
      </OneClickEmbedding>
    )
  }
}

export const GistFrame: React.FC<GistFrameProps> = ({ id }) => {
  const iframeHtml = useMemo(() => {
    return (`
      <html lang="en">
        <head>
          <base target="_parent">
          <title>gist</title>
          <style>
            * { font-size:12px; }
            body{ overflow:hidden; margin: 0;}
          </style>
          <script type="text/javascript">
            function doLoad() {
                window.parent.postMessage({eventType: 'gistResize', size: document.body.scrollHeight, id: '${id}'}, '*')
                tweakLinks();
            }
            function tweakLinks() {
                document.querySelectorAll(".gist-meta > a").forEach((link) => {
                    link.rel="noopener noreferer"
                    link.target="_blank"
                })
            }
          </script>
        </head>
        <body onload="doLoad()">
          <script type="text/javascript" src="https://gist.github.com/${id}.js"></script>
        </body>
      </html>`)
  }, [id])

  const [frameHeight, setFrameHeight] = useState(0)

  const sizeMessage = useCallback((message: MessageEvent) => {
    const data = message.data as resizeEvent
    if (data.id !== id) {
      return
    }
    setFrameHeight(data.size)
  }, [id])

  useEffect(() => {
    window.addEventListener('message', sizeMessage)
    return () => {
      window.removeEventListener('message', sizeMessage)
    }
  }, [sizeMessage])

  return (
    <iframe
      sandbox="allow-scripts allow-top-navigation-by-user-activation allow-popups"
      width='100%'
      height={`${frameHeight}px`}
      frameBorder='0'
      title={`gist ${id}`}
      src={`data:text/html;base64,${btoa(iframeHtml)}`}/>
  )
}

export { getElementReplacement as getGistReplacement }
