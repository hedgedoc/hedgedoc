/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { cypressId } from '../../../utils/cypress-attribute'
import { Logger } from '../../../utils/logger'
import styles from './mermaid.module.scss'
import React, { Fragment, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-use'
import { ApplicationErrorAlert } from '../../../components/common/application-error-alert/application-error-alert'

const log = new Logger('MermaidChart')

let mermaidInitialized = false

const loadMermaid = async (): Promise<(typeof import('mermaid'))['default']> => {
  try {
    return (await import(/* webpackChunkName: "mermaid" */ 'mermaid')).default
  } catch (error) {
    log.error('Error while loading mermaid', error)
    throw new Error('Error while loading mermaid')
  }
}

/**
 * Renders a mermaid diagram.
 *
 * @param code The code for the diagram.
 * @see https://mermaid-js.github.io/mermaid/#/
 */
export const MermaidChart: React.FC<CodeProps> = ({ code }) => {
  const diagramContainer = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { error } = useAsync(async () => {
    if (!diagramContainer.current) {
      return
    }

    const mermaid = await loadMermaid()

    if (!mermaidInitialized) {
      mermaid.initialize({ startOnLoad: false, securityLevel: 'sandbox' })
      mermaidInitialized = true
    }

    try {
      if (!diagramContainer.current) {
        return
      }
      await mermaid.parse(code)
      delete diagramContainer.current.dataset.processed
      diagramContainer.current.textContent = code
      await mermaid.init(undefined, diagramContainer.current)
    } catch (error) {
      const message = (error as Error).message
      log.error(error)
      diagramContainer.current?.querySelectorAll('iframe').forEach((child) => child.remove())
      throw new Error(message ?? t('renderer.mermaid.unknownError'))
    }
  }, [code, t])

  return (
    <Fragment>
      {error !== undefined && <ApplicationErrorAlert className={'text-wrap'}>{error?.message}</ApplicationErrorAlert>}
      <div
        {...cypressId('mermaid-frame')}
        className={`text-center ${styles['mermaid']} bg-dark text-black`}
        ref={diagramContainer}
      />
    </Fragment>
  )
}
