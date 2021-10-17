/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { AbcFrame } from './abc-frame'

/**
 * Detects code blocks with "abc" as language and renders them as ABC.js
 */
export class AbcReplacer extends ComponentReplacer {
  getReplacement(codeNode: Element): React.ReactElement | undefined {
    if (
      codeNode.name !== 'code' ||
      !codeNode.attribs ||
      !codeNode.attribs['data-highlight-language'] ||
      codeNode.attribs['data-highlight-language'] !== 'abc' ||
      !codeNode.children ||
      !codeNode.children[0]
    ) {
      return
    }

    const code = ComponentReplacer.extractTextChildContent(codeNode)

    return <AbcFrame code={code} />
  }
}
