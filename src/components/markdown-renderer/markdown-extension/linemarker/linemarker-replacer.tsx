/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import { ComponentReplacer } from '../../replace-components/component-replacer'
import { LinemarkerMarkdownExtension } from './linemarker-markdown-extension'

/**
 * Detects line markers and suppresses them in the resulting DOM.
 */
export class LinemarkerReplacer extends ComponentReplacer {
  public replace(codeNode: Element): null | undefined {
    return codeNode.name === LinemarkerMarkdownExtension.tagName ? null : undefined
  }
}
