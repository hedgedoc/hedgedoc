/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { DomElement } from 'domhandler'
import MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { getAttributesFromHedgeDocTag } from '../utils'
import { PdfFrame } from './pdf-frame'
import { replacePdfShortCode } from './replace-pdf-short-code'

export class PdfReplacer extends ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  public getReplacement (node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromHedgeDocTag(node, 'pdf')
    if (attributes && attributes.url) {
      const pdfUrl = attributes.url
      const count = (this.counterMap.get(pdfUrl) || 0) + 1
      this.counterMap.set(pdfUrl, count)
      return <PdfFrame url={pdfUrl}/>
    }
  }

  public static readonly markdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
    markdownItRegex(markdownIt, replacePdfShortCode)
  }
}
