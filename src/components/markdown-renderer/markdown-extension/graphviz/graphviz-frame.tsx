/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { ShowIf } from '../../../common/show-if/show-if'
import { useFrontendBaseUrl } from '../../../../hooks/common/use-frontend-base-url'
import { Logger } from '../../../../utils/logger'
import { cypressId } from '../../../../utils/cypress-attribute'
import type { CodeProps } from '../../replace-components/code-block-component-replacer'

const log = new Logger('GraphvizFrame')

export const GraphvizFrame: React.FC<CodeProps> = ({ code }) => {
  const container = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string>()

  const showError = useCallback((error: string) => {
    if (!container.current) {
      return
    }
    setError(error)
    log.error(error)
    container.current.querySelectorAll('svg').forEach((child) => child.remove())
  }, [])

  const frontendBaseUrl = useFrontendBaseUrl()

  useEffect(() => {
    if (!container.current) {
      return
    }
    const actualContainer = container.current

    import(/* webpackChunkName: "d3-graphviz" */ '@hpcc-js/wasm')
      .then((wasmPlugin) => {
        wasmPlugin.wasmFolder(`${frontendBaseUrl}/static/js`)
      })
      .then(() => import(/* webpackChunkName: "d3-graphviz" */ 'd3-graphviz'))
      .then((graphvizImport) => {
        try {
          setError(undefined)
          graphvizImport
            .graphviz(actualContainer, {
              useWorker: false,
              zoom: false
            })
            .onerror(showError)
            .renderDot(code)
        } catch (error) {
          showError(error as string)
        }
      })
      .catch((error: Error) => {
        log.error('Error while loading graphviz', error)
      })
  }, [code, error, frontendBaseUrl, showError])

  return (
    <Fragment>
      <ShowIf condition={!!error}>
        <Alert variant={'warning'}>{error}</Alert>
      </ShowIf>
      <div className={'svg-container'} {...cypressId('graphviz')} ref={container} />
    </Fragment>
  )
}

export default GraphvizFrame
