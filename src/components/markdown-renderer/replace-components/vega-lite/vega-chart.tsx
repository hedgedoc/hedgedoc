import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import embed, { VisualizationSpec } from 'vega-embed'
import { ShowIf } from '../../../common/show-if/show-if'

export interface VegaChartProps {
  code: string
}

export const VegaChart: React.FC<VegaChartProps> = ({ code }) => {
  const diagramContainer = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string>()
  const { t } = useTranslation()

  const showError = useCallback((error: string) => {
    if (!diagramContainer.current) {
      return
    }
    console.error(error)
    setError(error)
  }, [])

  useEffect(() => {
    if (!diagramContainer.current) {
      return
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spec: VisualizationSpec = JSON.parse(code)
      showError('')
      embed(diagramContainer.current, spec, {
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
        .then(result => console.log(result))
        .catch(err => showError(err))
    } catch (err) {
      showError(t('renderer.vega-lite.errorJson'))
    }
  }, [code, showError, t])

  return <Fragment>
    <ShowIf condition={!!error}>
      <Alert variant={'danger'}>{error}</Alert>
    </ShowIf>
    <div className={'text-center'}>
      <div ref={diagramContainer}/>
    </div>
  </Fragment>
}
