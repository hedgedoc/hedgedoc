import { graphviz } from 'd3-graphviz'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import '@hpcc-js/wasm'
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
    try {
      setError(undefined)
      graphviz(container.current, { useWorker: false, zoom: false })
        .onerror(showError)
        .renderDot(code)
    } catch (error) {
      showError(error)
    }
  }, [code, error, showError])

  return <Fragment>
    <ShowIf condition={!!error}>
      <Alert variant={'warning'}>{error}</Alert>
    </ShowIf>
    <div className={'text-center'} ref={container} />
  </Fragment>
}
