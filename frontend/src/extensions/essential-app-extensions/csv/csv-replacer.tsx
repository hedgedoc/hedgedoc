/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CodeBlockComponentReplacer } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import type { NodeReplacement } from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import { CsvTable } from './csv-table'
import type { Element } from 'domhandler'
import React from 'react'

/**
 * Detects code blocks with "csv" as language and renders them as table.
 */
export class CsvReplacer extends ComponentReplacer {
  public replace(codeNode: Element): NodeReplacement {
    const code = CodeBlockComponentReplacer.extractTextFromCodeNode(codeNode, 'csv')
    if (!code) {
      return DO_NOT_REPLACE
    }

    const extraData = codeNode.attribs['data-extra']
    const extraRegex = /\s*(delimiter=([^\s]*))?\s*(header)?/
    const extraInfos = extraRegex.exec(extraData)

    const delimiter = extraInfos?.[2] ?? ','
    const showHeader = extraInfos?.[3] !== undefined

    return <CsvTable code={code} delimiter={delimiter} showHeader={showHeader} />
  }
}
