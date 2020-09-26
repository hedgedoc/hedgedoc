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

    Promise.all([import(/* webpackChunkName: "d3-graphviz" */ 'd3-graphviz'), import('@hpcc-js/wasm')]).then(([imp]) => {
      try {
        setError(undefined)
        imp.graphviz(actualContainer, { useWorker: false, zoom: false })
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
    <div className={'text-center'} ref={container} />
  </Fragment>
}

export default GraphvizFrame
