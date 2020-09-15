import mermaid from 'mermaid'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ShowIf } from '../../../common/show-if/show-if'

export interface MermaidChartProps {
  code: string
}

interface MermaidParseError {
  str: string
}

let mermaidInitialized = false

export const MermaidChart: React.FC<MermaidChartProps> = ({ code }) => {
  const diagramContainer = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string>()
  const { t } = useTranslation()

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({ startOnLoad: false })
      mermaidInitialized = true
    }
  }, [])

  const showError = useCallback((error: string) => {
    if (!diagramContainer.current) {
      return
    }
    setError(error)
    console.error(error)
    diagramContainer.current.querySelectorAll('svg').forEach(child => child.remove())
  }, [])

  useEffect(() => {
    if (!diagramContainer.current) {
      return
    }
    try {
      mermaid.parse(code)
      delete diagramContainer.current.dataset.processed
      diagramContainer.current.textContent = code
      mermaid.init(diagramContainer.current)
      setError(undefined)
    } catch (error) {
      const message = (error as MermaidParseError).str
      showError(message || t('renderer.mermaid.unknownError'))
    }
  }, [code, showError, t])

  return <Fragment>
    <ShowIf condition={!!error}>
      <Alert variant={'warning'}>{error}</Alert>
    </ShowIf>
    <div className={'text-center mermaid'} ref={diagramContainer}/>
  </Fragment>
}
