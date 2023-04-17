/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import fontStyles from '../../../../global-styles/variables.module.scss'
import { AsyncLoadingBoundary } from '../../../components/common/async-loading-boundary/async-loading-boundary'
import { ShowIf } from '../../../components/common/show-if/show-if'
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { useDarkModeState } from '../../../hooks/common/use-dark-mode-state'
import { Logger } from '../../../utils/logger'
import { testId } from '../../../utils/test-id'
import React, { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useAsync } from 'react-use'

const log = new Logger('FlowChart')

/**
 * Renders a flowchart.
 *
 * @param code The code to render the flowchart.
 * @see https://flowchart.js.org/
 */
export const FlowChart: React.FC<CodeProps> = ({ code }) => {
  const diagramRef = useRef<HTMLDivElement>(null)
  const [syntaxError, setSyntaxError] = useState(false)
  const darkModeActivated = useDarkModeState()

  useTranslation()

  const {
    value: flowchartLib,
    loading,
    error: libLoadingError
  } = useAsync(async () => import(/* webpackChunkName: "flowchart.js" */ 'flowchart.js'), [])

  useEffect(() => {
    if (libLoadingError) {
      log.error('Error while loading flowchart.js', libLoadingError)
    }
  })

  useEffect(() => {
    if (diagramRef.current === null || flowchartLib === undefined) {
      return
    }
    const currentDiagramRef = diagramRef.current
    try {
      const parserOutput = flowchartLib.parse(code)
      parserOutput.drawSVG(currentDiagramRef, {
        'line-width': 2,
        fill: 'none',
        'font-size': 16,
        'line-color': darkModeActivated ? '#ffffff' : '#000000',
        'element-color': darkModeActivated ? '#ffffff' : '#000000',
        'font-color': darkModeActivated ? '#ffffff' : '#000000',
        'font-family': fontStyles['font-family-base']
      })
      setSyntaxError(false)
    } catch (error) {
      log.error('Error while rendering flowchart', error)
      setSyntaxError(true)
    }

    return () => {
      Array.from(currentDiagramRef.children).forEach((value) => value.remove())
    }
  }, [code, darkModeActivated, flowchartLib])

  return (
    <AsyncLoadingBoundary loading={loading || !flowchartLib} componentName={'flowchart.js'} error={!!libLoadingError}>
      <ShowIf condition={syntaxError}>
        <Alert variant={'danger'}>
          <Trans i18nKey={'renderer.flowchart.invalidSyntax'} />
        </Alert>
      </ShowIf>
      <div ref={diagramRef} {...testId('flowchart')} className={'text-center'} />
    </AsyncLoadingBoundary>
  )
}
