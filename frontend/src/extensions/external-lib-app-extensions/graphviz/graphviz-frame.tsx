/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AsyncLoadingBoundary } from '../../../components/common/async-loading-boundary/async-loading-boundary'
import { ShowIf } from '../../../components/common/show-if/show-if'
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { cypressId } from '../../../utils/cypress-attribute'
import { Logger } from '@hedgedoc/commons'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { ApplicationErrorAlert } from '../../../components/common/application-error-alert/application-error-alert'

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

  const {
    value: graphvizImport,
    error: libLoadingError,
    loading: isLibLoading
  } = useAsync(() => import(/* webpackChunkName: "d3-graphviz" */ 'd3-graphviz'), [])

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
  }, [code, showError, graphvizImport])

  return (
    <AsyncLoadingBoundary loading={isLibLoading || !graphvizImport} componentName={'graphviz'} error={libLoadingError}>
      <ShowIf condition={!!error}>
        <ApplicationErrorAlert className={'text-wrap'}>{error}</ApplicationErrorAlert>
      </ShowIf>
      <div className={'svg-container'} {...cypressId('graphviz')} ref={container} />
    </AsyncLoadingBoundary>
  )
}

export default GraphvizFrame
