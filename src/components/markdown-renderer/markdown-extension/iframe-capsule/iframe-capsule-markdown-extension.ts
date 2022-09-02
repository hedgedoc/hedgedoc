/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { IframeCapsuleReplacer } from './iframe-capsule-replacer'

/**
 * Adds a replacer that capsules iframes in a click shield.
 */
export class IframeCapsuleMarkdownExtension extends MarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new IframeCapsuleReplacer()]
  }

  public buildTagNameAllowList(): string[] {
    return ['iframe']
  }
}
