/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeReplacement } from '../../replace-components/component-replacer'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import { LinemarkerMarkdownExtension } from './linemarker-markdown-extension'
import type { Element } from 'domhandler'

/**
 * Detects line markers and suppresses them in the resulting DOM.
 */
export class LinemarkerReplacer extends ComponentReplacer {
  public replace(codeNode: Element): NodeReplacement {
    return codeNode.name === LinemarkerMarkdownExtension.tagName ? null : DO_NOT_REPLACE
  }
}
