/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import React, { Fragment } from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { MermaidChart } from '../mermaid/mermaid-chart'
import { DeprecationWarning } from './deprecation-warning'

/**
 * Detects code blocks with 'sequence' as language and renders them as
 * sequence diagram with mermaid.
 */
export class SequenceDiagramReplacer extends ComponentReplacer {
  getReplacement(codeNode: Element): React.ReactElement | undefined {
    if (
      codeNode.name !== 'code' ||
      !codeNode.attribs ||
      !codeNode.attribs['data-highlight-language'] ||
      codeNode.attribs['data-highlight-language'] !== 'sequence' ||
      !codeNode.children ||
      !codeNode.children[0]
    ) {
      return
    }

    const code = ComponentReplacer.extractTextChildContent(codeNode)

    return (
      <Fragment>
        <DeprecationWarning />
        <MermaidChart code={'sequenceDiagram\n' + code} />
      </Fragment>
    )
  }
}
