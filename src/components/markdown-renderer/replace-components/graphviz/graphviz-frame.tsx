/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { ShowIf } from '../../../common/show-if/show-if'

export interface GraphvizFrameProps {
  code: string
}

export const GraphvizFrame: React.FC<GraphvizFrameProps> = ({ code }) => {
  const container = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string>()

  const showError = useCallback((error: string) => {
    if (!container.current) {
      return
    }
    setError(error)
    console.error(error)
    container.current.querySelectorAll('svg').forEach(child => child.remove())
  }, [])

  useEffect(() => {
    if (!container.current) {
      return
    }
    const actualContainer = container.current

    import('@hpcc-js/wasm')
      .then((wasmPlugin) => {
        wasmPlugin.wasmFolder('/static/js')
      })
      .then(() => import(/* webpackChunkName: "d3-graphviz" */ 'd3-graphviz'))
      .then((graphvizImport) => {
        try {
          setError(undefined)
          graphvizImport.graphviz(actualContainer, {
            useWorker: false,
            zoom: false
          })
            .onerror(showError)
            .renderDot(code)
        } catch (error) {
          showError(error)
        }
      }).catch(() => { console.error('error while loading graphviz') })
  }, [code, error, showError])

  return <Fragment>
    <ShowIf condition={!!error}>
      <Alert variant={'warning'}>{error}</Alert>
    </ShowIf>
    <div className={'text-center overflow-x-auto'} ref={container} />
  </Fragment>
}

export default GraphvizFrame
