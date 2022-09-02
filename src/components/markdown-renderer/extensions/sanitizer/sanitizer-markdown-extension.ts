/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SanitizerNodePreprocessor } from './dom-purifier-node-preprocessor'
import type { NodeProcessor } from '../../node-preprocessors/node-processor'
import { MarkdownRendererExtension } from '../base/markdown-renderer-extension'

/**
 * Adds support for html sanitizing using dompurify to the markdown rendering.
 */
export class SanitizerMarkdownExtension extends MarkdownRendererExtension {
  constructor(private tagNameWhiteList: string[]) {
    super()
  }

  public buildNodeProcessors(): NodeProcessor[] {
    return [new SanitizerNodePreprocessor(this.tagNameWhiteList)]
  }
}
