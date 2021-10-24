/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import { ComponentReplacer } from '../component-replacer'

/**
 * Detects line markers and suppresses them in the resulting DOM.
 */
export class LinemarkerReplacer extends ComponentReplacer {
  public replace(codeNode: Element): null | undefined {
    return codeNode.name === 'app-linemarker' ? null : undefined
  }
}
