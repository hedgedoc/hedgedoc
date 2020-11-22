/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LockButton } from '../../../common/lock-button/lock-button'
import '../../utils/button-inside.scss'

export interface MarkmapFrameProps {
  code: string
}

const blockHandler = (event: Event): void => {
  event.stopPropagation()
}

export const MarkmapFrame: React.FC<MarkmapFrameProps> = ({ code }) => {
  const { t } = useTranslation()
  const diagramContainer = useRef<HTMLDivElement>(null)
  const [disablePanAndZoom, setDisablePanAndZoom] = useState(true)

  useEffect(() => {
    if (diagramContainer.current) {
      if (disablePanAndZoom) {
        diagramContainer.current.addEventListener('wheel', blockHandler, true)
        diagramContainer.current.addEventListener('mousedown', blockHandler, true)
        diagramContainer.current.addEventListener('click', blockHandler, true)
        diagramContainer.current.addEventListener('dblclick', blockHandler, true)
        diagramContainer.current.addEventListener('touchstart', blockHandler, true)
      } else {
        diagramContainer.current.removeEventListener('wheel', blockHandler, true)
        diagramContainer.current.removeEventListener('mousedown', blockHandler, true)
        diagramContainer.current.removeEventListener('click', blockHandler, true)
        diagramContainer.current.removeEventListener('dblclick', blockHandler, true)
        diagramContainer.current.removeEventListener('touchstart', blockHandler, true)
      }
    }
  }, [diagramContainer, disablePanAndZoom])

  useEffect(() => {
    if (!diagramContainer.current) {
      return
    }
    const actualContainer = diagramContainer.current
    Promise.all([import(/* webpackChunkName: "markmap" */ 'markmap-lib'), import(/* webpackChunkName: "markmap" */ 'markmap-view')])
      .then(([{ transform }, { Markmap }]) => {
        const svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '100%')
        actualContainer.querySelectorAll('svg').forEach(child => child.remove())
        actualContainer.appendChild(svg)
        const { root } = transform(code)
        Markmap.create(svg, {}, root)
      }).catch(() => {
        console.error('error while loading markmap')
      })
  }, [code])

  return (
    <Fragment>
      <div className={'text-center'} ref={diagramContainer}/>
      <div className={'text-right button-inside'}>
        <LockButton locked={disablePanAndZoom} onLockedChanged={(newState => setDisablePanAndZoom(newState))}
                    title={disablePanAndZoom ? t('renderer.markmap.locked') : t('renderer.markmap.unlocked')}/>
      </div>
    </Fragment>
  )
}
