import React, { useEffect, useRef } from 'react'
import { renderAbc } from 'abcjs'

export interface AbcFrameProps {
  code: string
}
export const AbcFrame: React.FC<AbcFrameProps> = ({ code }) => {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (container.current) {
      renderAbc(container.current, code)
    }
  }, [code])

  return (
    <div ref={container} className={'bg-white text-center'}/>
  )
}
