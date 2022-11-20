/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { useRouter } from 'next/router'
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { cypressId } from '../../../utils/cypress-attribute'
import { ShowIf } from '../../../components/common/show-if/show-if'
import { Logger } from '../../../utils/logger'
import { useAsync } from 'react-use'
import { AsyncLoadingBoundary } from '../../../components/common/async-loading-boundary'

const log = new Logger('GraphvizFrame')
/**
 * Renders a graphviz diagram.
 *
 * @param code The code for the diagram
 * @see https://graphviz.org/
 */
export const GraphvizFrame: React.FC<CodeProps> = ({ code }) => {
  const container = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string>()

  const { basePath } = useRouter()

  const {
    value: graphvizImport,
    error: libLoadingError,
    loading: isLibLoading
  } = useAsync(
    async () =>
      import(/* webpackChunkName: "d3-graphviz" */ '@hpcc-js/wasm')
        .then((wasmPlugin) => {
          wasmPlugin.wasmFolder(`${basePath}/_next/static/js`)
        })
        .then(() => import(/* webpackChunkName: "d3-graphviz" */ 'd3-graphviz')),
    []
  )

  const showError = useCallback((error: string) => {
    if (!container.current) {
      return
    }
    setError(error)
    log.error(error)
    container.current.querySelectorAll('svg').forEach((child) => child.remove())
  }, [])

  useEffect(() => {
    if (!container.current || !graphvizImport) {
      return
    }

    try {
      setError(undefined)
      graphvizImport
        .graphviz(container.current, {
          useWorker: false,
          zoom: false
        })
        .onerror(showError)
        .renderDot(code)
    } catch (error) {
      showError(error as string)
    }
  }, [code, basePath, showError, graphvizImport])

  return (
    <AsyncLoadingBoundary loading={isLibLoading} componentName={'graphviz'} error={libLoadingError}>
      <ShowIf condition={!!error}>
        <Alert variant={'warning'}>{error}</Alert>
      </ShowIf>
      <div className={'svg-container'} {...cypressId('graphviz')} ref={container} />
    </AsyncLoadingBoundary>
  )
}

export default GraphvizFrame
