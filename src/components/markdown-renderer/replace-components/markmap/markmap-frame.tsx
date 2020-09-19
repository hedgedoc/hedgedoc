import { transform } from 'markmap-lib/dist/transform'
import { Markmap } from 'markmap-lib/dist/view'
import React, { useEffect, useRef } from 'react'

export interface MarkmapFrameProps {
  code: string
}

export const MarkmapFrame: React.FC<MarkmapFrameProps> = ({ code }) => {
  const diagramContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!diagramContainer.current) {
      return
    }
    const svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '100%')
    diagramContainer.current.querySelectorAll('svg').forEach(child => child.remove())
    diagramContainer.current.appendChild(svg)
    const data = transform(code)
    Markmap.create(svg, {}, data)
  }, [code])

  return <div className={'text-center'} ref={diagramContainer}/>
}
