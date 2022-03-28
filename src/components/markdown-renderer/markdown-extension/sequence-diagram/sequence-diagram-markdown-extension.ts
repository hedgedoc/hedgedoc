/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CodeBlockComponentReplacer } from '../../replace-components/code-block-component-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { SequenceDiagram } from './sequence-diagram'
import { CodeBlockMarkdownExtension } from '../code-block-markdown-extension/code-block-markdown-extension'

/**
 * Adds legacy support for sequence diagram to the markdown rendering using code fences with "sequence" as language.
 */
export class SequenceDiagramMarkdownExtension extends CodeBlockMarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CodeBlockComponentReplacer(SequenceDiagram, 'sequence')]
  }
}
