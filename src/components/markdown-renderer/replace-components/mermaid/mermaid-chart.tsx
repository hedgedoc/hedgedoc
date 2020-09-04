import mermaid from 'mermaid'
import React, { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { v4 as uuid } from 'uuid'

export interface MermaidChartProps {
  code: string
}

interface MermaidParseError {
  str: string
}

let mermaidInitialized = false

export const MermaidChart: React.FC<MermaidChartProps> = ({ code }) => {
  const [diagramId] = useState(() => 'mermaid_' + uuid().replaceAll('-', '_'))
  const diagramContainer = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string>()
  const { t } = useTranslation()

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({ startOnLoad: false })
      mermaidInitialized = true
    }
  }, [])

  useEffect(() => {
    try {
      if (!diagramContainer.current) {
        return
      }
      mermaid.parse(code)
      delete diagramContainer.current.dataset.processed
      diagramContainer.current.textContent = code
      mermaid.init(`#${diagramId}`)
    } catch (error) {
      const message = (error as MermaidParseError).str
      if (message) {
        setError(message)
      } else {
        setError(t('renderer.mermaid.unknownError'))
        console.error(error)
      }
    }
  }, [code, diagramId, t])

  return error
    ? <Alert variant={'warning'}>{error}</Alert>
    : <div className={'text-center mermaid'} ref={diagramContainer} id={diagramId}/>
}
