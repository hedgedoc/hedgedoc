/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AsyncLoadingBoundary } from '../../../components/common/async-loading-boundary/async-loading-boundary'
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { Logger } from '../../../utils/logger'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-use'
import type { VisualizationSpec } from 'vega-embed'
import { TranslatedApplicationErrorAlert } from '../../../components/common/application-error-alert/translated-application-error-alert'

const log = new Logger('VegaChart')

/**
 * Renders a vega lite diagram.
 *
 * @param code The code for the diagram.
 * @see https://vega.github.io/vega-lite/
 */
export const VegaLiteChart: React.FC<CodeProps> = ({ code }) => {
  const diagramContainer = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const {
    value: vegaEmbed,
    error: libLoadingError,
    loading: libLoading
  } = useAsync(async () => (await import(/* webpackChunkName: "vega" */ 'vega-embed')).default, [])

  const { error: renderingError } = useAsync(async () => {
    const container = diagramContainer.current
    if (!container || !vegaEmbed) {
      return
    }
    const spec = JSON.parse(code) as VisualizationSpec
    await vegaEmbed(container, spec, {
      actions: {
        export: true,
        source: false,
        compiled: false,
        editor: false
      },
      i18n: {
        PNG_ACTION: t('renderer.vega-lite.png') ?? undefined,
        SVG_ACTION: t('renderer.vega-lite.svg') ?? undefined
      }
    })
  }, [code, vegaEmbed, t])

  useEffect(() => {
    if (renderingError) {
      log.error('Error while rendering vega lite diagram', renderingError)
    }
  }, [renderingError])

  return (
    <AsyncLoadingBoundary loading={libLoading || !vegaEmbed} error={libLoadingError} componentName={'Vega Lite'}>
      {renderingError !== undefined && (
        <TranslatedApplicationErrorAlert errorI18nKey={'renderer.vega-lite.errorJson'} />
      )}
      <div className={'text-center'}>
        <div ref={diagramContainer} />
      </div>
    </AsyncLoadingBoundary>
  )
}
