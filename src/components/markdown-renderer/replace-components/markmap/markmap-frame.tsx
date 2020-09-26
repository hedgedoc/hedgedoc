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
    const actualContainer = diagramContainer.current
    Promise.all([import(/* webpackChunkName: "markmap" */ 'markmap-lib/dist/transform'), import(/* webpackChunkName: "markmap" */ 'markmap-lib/dist/view')])
      .then(([transform, view]) => {
        const svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '100%')
        actualContainer.querySelectorAll('svg').forEach(child => child.remove())
        actualContainer.appendChild(svg)
        const data = transform.transform(code)
        view.Markmap.create(svg, {}, data)
      }).catch(() => { console.error('error while loading markmap') })
  }, [code])

  return <div className={'text-center'} ref={diagramContainer}/>
}
