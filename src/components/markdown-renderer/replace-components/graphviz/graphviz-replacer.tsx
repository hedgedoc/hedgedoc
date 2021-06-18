/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Element } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { GraphvizFrame } from './graphviz-frame'

/**
 * Detects code blocks with "graphviz" as language and renders them as graphviz graph.
 */
export class GraphvizReplacer extends ComponentReplacer {
  getReplacement(codeNode: Element): React.ReactElement | undefined {
    if (
      codeNode.name !== 'code' ||
      !codeNode.attribs ||
      !codeNode.attribs['data-highlight-language'] ||
      codeNode.attribs['data-highlight-language'] !== 'graphviz' ||
      !codeNode.children ||
      !codeNode.children[0]
    ) {
      return
    }

    const code = ComponentReplacer.extractTextChildContent(codeNode)

    return <GraphvizFrame code={code} />
  }
}
