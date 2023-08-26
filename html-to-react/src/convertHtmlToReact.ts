/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { parseDocument } from 'htmlparser2'
import { processNodes } from './processNodes.js'
import { ReactElement } from 'react'
import { Document } from 'domhandler'
import { NodeToReactElementTransformer } from './NodeToReactElementTransformer.js'

export interface ParserOptions {
  decodeEntities?: boolean
  transform?: NodeToReactElementTransformer
  preprocessNodes?: (nodes: Document) => Document
}

/**
 * Parses an HTML string and returns a list of React components generated from it
 *
 * @param {String} html The HTML to convert into React component
 * @param {Object} options Options to pass
 * @returns {Array} List of top level React elements
 */
export function convertHtmlToReact(
  html: string,
  options?: ParserOptions
): (ReactElement | string | null)[] {
  const parsedDocument = parseDocument(html, {
    decodeEntities: options?.decodeEntities ?? true
  })

  const processedDocument =
    options?.preprocessNodes?.(parsedDocument) ?? parsedDocument

  return processNodes(processedDocument.childNodes, options?.transform)
}
