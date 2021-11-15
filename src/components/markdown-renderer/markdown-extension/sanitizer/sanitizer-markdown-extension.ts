/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import { SanitizerNodePreprocessor } from './dom-purifier-node-preprocessor'
import type { NodeProcessor } from '../../node-preprocessors/node-processor'

/**
 * Adds support for html sanitizing using dompurify to the markdown rendering.
 */
export class SanitizerMarkdownExtension extends MarkdownExtension {
  constructor(private tagNameWhiteList: string[]) {
    super()
  }

  public buildNodeProcessors(): NodeProcessor[] {
    return [new SanitizerNodePreprocessor(this.tagNameWhiteList)]
  }
}
