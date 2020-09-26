import React, { useEffect, useRef } from 'react'

export interface AbcFrameProps {
  code: string
}

export const AbcFrame: React.FC<AbcFrameProps> = ({ code }) => {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) {
      return
    }
    const actualContainer = container.current
    import(/* webpackChunkName: "abc.js" */ 'abcjs').then((imp) => {
      imp.renderAbc(actualContainer, code)
    }).catch(() => { console.error('error while loading abcjs') })
  }, [code])

  return <div ref={container} className={'bg-white text-center'}/>
}
