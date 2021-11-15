/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ShowIf } from '../../../common/show-if/show-if'
import './mermaid.scss'
import { Logger } from '../../../../utils/logger'
import type { CodeProps } from '../../replace-components/code-block-component-replacer'

const log = new Logger('MermaidChart')

interface MermaidParseError {
  str: string
}

let mermaidInitialized = false

export const MermaidChart: React.FC<CodeProps> = ({ code }) => {
  const diagramContainer = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string>()
  const { t } = useTranslation()

  useEffect(() => {
    if (!mermaidInitialized) {
      import(/* webpackChunkName: "mermaid" */ 'mermaid')
        .then((mermaid) => {
          mermaid.default.initialize({ startOnLoad: false })
          mermaidInitialized = true
        })
        .catch((error: Error) => {
          log.error('Error while loading mermaid', error)
        })
    }
  }, [])

  const showError = useCallback(
    (error: string) => {
      setError(error)
      log.error(error)
      if (!diagramContainer.current) {
        return
      }
      diagramContainer.current.querySelectorAll('svg').forEach((child) => child.remove())
    },
    [setError]
  )

  useEffect(() => {
    if (!diagramContainer.current) {
      return
    }
    import(/* webpackChunkName: "mermaid" */ 'mermaid')
      .then((mermaid) => {
        try {
          if (!diagramContainer.current) {
            return
          }
          mermaid.default.parse(code)
          delete diagramContainer.current.dataset.processed
          diagramContainer.current.textContent = code
          mermaid.default.init(diagramContainer.current)
          setError(undefined)
        } catch (error) {
          const message = (error as MermaidParseError).str
          showError(message || t('renderer.mermaid.unknownError'))
        }
      })
      .catch(() => showError('Error while loading mermaid'))
  }, [code, showError, t])

  return (
    <Fragment>
      <ShowIf condition={!!error}>
        <Alert variant={'warning'}>{error}</Alert>
      </ShowIf>
      <div className={'text-center mermaid text-black'} ref={diagramContainer} />
    </Fragment>
  )
}
