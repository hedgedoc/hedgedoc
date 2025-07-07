/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { measurePerformance } from '../../../utils/measure-performance'
import type { ParserOptions } from '@hedgedoc/html-to-react'
import { convertHtmlToReact } from '@hedgedoc/html-to-react'
import DOMPurify from 'dompurify'
import React, { Fragment, useMemo } from 'react'

export interface HtmlToReactProps {
  htmlCode: string
  domPurifyConfig?: DOMPurify.Config
  parserOptions?: ParserOptions
}

const REGEX_URI_SCHEME_NO_SCRIPTS = /^(?!.*script:).+:?/i

/**
 * Renders
 * @param htmlCode
 * @param domPurifyConfig
 * @param parserOptions
 * @constructor
 */
export const HtmlToReact: React.FC<HtmlToReactProps> = ({ htmlCode, domPurifyConfig, parserOptions }) => {
  const elements = useMemo(() => {
    const sanitizedHtmlCode = measurePerformance('html-to-react: sanitize', () => {
      return DOMPurify.sanitize(htmlCode, {
        ...domPurifyConfig,
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM: false,
        ALLOWED_URI_REGEXP: REGEX_URI_SCHEME_NO_SCRIPTS
      })
    })
    return measurePerformance('html-to-react: convertHtmlToReact', () => {
      return convertHtmlToReact(sanitizedHtmlCode, parserOptions)
    })
  }, [domPurifyConfig, htmlCode, parserOptions])

  return <Fragment>{elements}</Fragment>
}
