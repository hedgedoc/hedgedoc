/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import type { VisualizationSpec } from 'vega-embed'
import { ShowIf } from '../../../common/show-if/show-if'
import { Logger } from '../../../../utils/logger'
import type { CodeProps } from '../../replace-components/code-block-component-replacer'

const log = new Logger('VegaChart')

export const VegaLiteChart: React.FC<CodeProps> = ({ code }) => {
  const diagramContainer = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string>()
  const { t } = useTranslation()

  const showError = useCallback((error: string) => {
    if (!diagramContainer.current) {
      return
    }
    log.error(error)
    setError(error)
  }, [])

  useEffect(() => {
    if (!diagramContainer.current) {
      return
    }
    import(/* webpackChunkName: "vega" */ 'vega-embed')
      .then((embed) => {
        try {
          if (!diagramContainer.current) {
            return
          }

          const spec = JSON.parse(code) as VisualizationSpec
          embed
            .default(diagramContainer.current, spec, {
              actions: {
                export: true,
                source: false,
                compiled: false,
                editor: false
              },
              i18n: {
                PNG_ACTION: t('renderer.vega-lite.png'),
                SVG_ACTION: t('renderer.vega-lite.svg')
              }
            })
            .then(() => setError(undefined))
            .catch((error: Error) => showError(error.message))
        } catch (error) {
          showError(t('renderer.vega-lite.errorJson'))
        }
      })
      .catch((error: Error) => {
        log.error('Error while loading vega-light', error)
      })
  }, [code, showError, t])

  return (
    <Fragment>
      <ShowIf condition={!!error}>
        <Alert variant={'danger'}>{error}</Alert>
      </ShowIf>
      <div className={'text-center'}>
        <div ref={diagramContainer} />
      </div>
    </Fragment>
  )
}
