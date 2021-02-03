/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useIsDarkModeActivated } from '../../../../../hooks/common/use-is-dark-mode-activated'

export interface FlowChartProps {
  code: string
}

export const FlowChart: React.FC<FlowChartProps> = ({ code }) => {
  const diagramRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const darkModeActivated = useIsDarkModeActivated()

  useTranslation()

  useEffect(() => {
    if (diagramRef.current === null) {
      return
    }
    const currentDiagramRef = diagramRef.current
    import(/* webpackChunkName: "flowchart.js" */ 'flowchart.js').then((imp) => {
      const parserOutput = imp.parse(code)
      try {
        parserOutput.drawSVG(currentDiagramRef, {
          'line-width': 2,
          fill: 'none',
          'font-size': 16,
          'line-color': darkModeActivated ? '#ffffff' : '#000000',
          'element-color': darkModeActivated ? '#ffffff' : '#000000',
          'font-color': darkModeActivated ? '#ffffff' : '#000000',
          'font-family': 'Source Sans Pro, "Twemoji Mozilla", monospace'
        })
        setError(false)
      } catch (error) {
        setError(true)
      }
    })
                                                                 .catch(() => {
                                                                   console.error('error while loading flowchart.js')
                                                                 })

    return () => {
      Array.from(currentDiagramRef.children)
           .forEach(value => value.remove())
    }
  }, [code, darkModeActivated])

  if (error) {
    return (
      <Alert variant={ 'danger' }>
        <Trans i18nKey={ 'renderer.flowchart.invalidSyntax' }/>
      </Alert>)
  } else {
    return <div ref={ diagramRef } className={ 'text-center' }/>
  }
}
