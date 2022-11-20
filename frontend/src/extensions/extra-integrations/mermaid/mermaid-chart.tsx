/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useRef } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import styles from './mermaid.module.scss'
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { cypressId } from '../../../utils/cypress-attribute'
import { ShowIf } from '../../../components/common/show-if/show-if'
import { Logger } from '../../../utils/logger'
import { useAsync } from 'react-use'

const log = new Logger('MermaidChart')

let mermaidInitialized = false

const loadMermaid = async (): Promise<typeof import('mermaid')> => {
  try {
    return import(/* webpackChunkName: "mermaid" */ 'mermaid')
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
      mermaid.default.initialize({ startOnLoad: false })
      mermaidInitialized = true
    }

    try {
      if (!diagramContainer.current) {
        return
      }
      mermaid.default.parse(code)
      delete diagramContainer.current.dataset.processed
      diagramContainer.current.textContent = code
      await mermaid.default.init(undefined, diagramContainer.current)
    } catch (error) {
      const message = (error as Error).message
      log.error(error)
      diagramContainer.current?.querySelectorAll('svg').forEach((child) => child.remove())
      throw new Error(message ?? t('renderer.mermaid.unknownError'))
    }
  }, [code, t])

  return (
    <Fragment>
      <ShowIf condition={!!error}>
        <Alert variant={'warning'}>{error?.message}</Alert>
      </ShowIf>
      <div
        {...cypressId('mermaid-frame')}
        className={`text-center ${styles['mermaid']} text-black`}
        ref={diagramContainer}
      />
    </Fragment>
  )
}
