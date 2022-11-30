/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { AppExtension } from '../../base/app-extension'
import { SpoilerMarkdownExtension } from './spoiler-markdown-extension'

/**
 * Adds support for html spoiler tags.
 *
 * @see https://www.w3schools.com/tags/tag_details.asp
 */
export class SpoilerAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new SpoilerMarkdownExtension()]
  }
}
