/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NodeReplacement } from '../../replace-components/component-replacer'
import { ComponentReplacer } from '../../replace-components/component-replacer'
import type { Element } from 'domhandler'
import { ImagePlaceholder } from './image-placeholder'
import { ImagePlaceholderMarkdownExtension } from './image-placeholder-markdown-extension'

/**
 * Replaces every image tag that has the {@link ImagePlaceholderMarkdownExtension.PLACEHOLDER_URL placeholder url} with the {@link ImagePlaceholder image placeholder element}.
 */
export class ImagePlaceholderReplacer extends ComponentReplacer {
  private countPerSourceLine = new Map<number, number>()

  constructor() {
    super()
  }

  reset(): void {
    this.countPerSourceLine = new Map<number, number>()
  }

  replace(node: Element): NodeReplacement {
    if (node.name === 'img' && node.attribs && node.attribs.src === ImagePlaceholderMarkdownExtension.PLACEHOLDER_URL) {
      const lineIndex = Number(node.attribs['data-line'])
      const indexInLine = this.countPerSourceLine.get(lineIndex) ?? 0
      this.countPerSourceLine.set(lineIndex, indexInLine + 1)
      return (
        <ImagePlaceholder
          alt={node.attribs.alt}
          title={node.attribs.title}
          width={node.attribs.width}
          height={node.attribs.height}
          lineIndex={isNaN(lineIndex) ? undefined : lineIndex}
          placeholderIndexInLine={indexInLine}
        />
      )
    }
  }
}
