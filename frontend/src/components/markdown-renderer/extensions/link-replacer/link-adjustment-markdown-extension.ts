/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeProcessor } from '../../node-preprocessors/node-processor'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { MarkdownRendererExtension } from '../_base-classes/markdown-renderer-extension'
import { AnchorNodePreprocessor } from './anchor-node-preprocessor'
import { JumpAnchorReplacer } from './jump-anchor-replacer'

/**
 * Adds tweaks for anchor tags which are needed for the use in the secured iframe.
 */
export class LinkAdjustmentMarkdownExtension extends MarkdownRendererExtension {
  constructor(private baseUrl: string) {
    super()
  }

  public buildNodeProcessors(): NodeProcessor[] {
    return [new AnchorNodePreprocessor(this.baseUrl)]
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new JumpAnchorReplacer()]
  }
}
