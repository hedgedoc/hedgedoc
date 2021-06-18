/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Element } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { MermaidChart } from './mermaid-chart'

/**
 * Detects code blocks with 'mermaid' as language and renders them with mermaid.
 */
export class MermaidReplacer extends ComponentReplacer {
  getReplacement(codeNode: Element): React.ReactElement | undefined {
    if (
      codeNode.name !== 'code' ||
      !codeNode.attribs ||
      !codeNode.attribs['data-highlight-language'] ||
      codeNode.attribs['data-highlight-language'] !== 'mermaid' ||
      !codeNode.children ||
      !codeNode.children[0]
    ) {
      return
    }

    const code = ComponentReplacer.extractTextChildContent(codeNode)

    return <MermaidChart code={code} />
  }
}
