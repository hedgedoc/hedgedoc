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
 * Strip stray HTML wrapper tags that are never valid Mermaid syntax
 * but may appear via copy-paste from rich-text sources.
 * Converts <br> / <br/> to newline so line breaks survive the cleanup.
 * Uses flexible whitespace so variants like "</ p>" or "</p >" are removed too.
 */
const sanitizeMermaidCode = (raw: string): string => {
  const tagNames =
    'p|div|span|ul|ol|li|h[1-6]|strong|em|b|i|a|table|tr|td|th|thead|tbody|blockquote'
  // Opening and self-closing style tags, optional attrs, flexible spaces
  const openOrCloseTag = new RegExp(
    `<\\s*/?\\s*(${tagNames})(?:\\s[^>]*)?\\s*>`,
    'gi'
  )
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(openOrCloseTag, '')
    // Encoded tags sometimes appear in pasted content
    .replace(/&lt;\s*\/?\s*p(?:\s[^&]*)?&gt;/gi, '')
    .replace(/&lt;\s*br\s*\/?\s*&gt;/gi, '\n')
    // Final sweep: orphan closing/opening p tags (any spacing)
    .replace(/<\s*\/\s*p\s*>/gi, '')
    .replace(/<\s*p(?:\s[^>]*)?\s*>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
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
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'sandbox',
        flowchart: {
          nodeSpacing: 50,
          rankSpacing: 60,
          diagramPadding: 16,
          wrappingWidth: 220,
          subGraphTitleMargin: { top: 10, bottom: 6 }
        },
        sequence: {
          diagramMarginX: 16,
          diagramMarginY: 16,
          boxMargin: 10,
          noteMargin: 10,
          messageMargin: 40
        },
        themeVariables: {
          fontSize: '14px'
        }
      })
      mermaidInitialized = true
    }

    const sanitized = sanitizeMermaidCode(code)

    try {
      if (!diagramContainer.current) {
        return
      }
      await mermaid.parse(sanitized)
      delete diagramContainer.current.dataset.processed
      diagramContainer.current.textContent = sanitized
      await mermaid.run({ nodes: [diagramContainer.current] })
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
        className={`text-center ${styles['mermaid']}`}
        ref={diagramContainer}
      />
    </Fragment>
  )
}
