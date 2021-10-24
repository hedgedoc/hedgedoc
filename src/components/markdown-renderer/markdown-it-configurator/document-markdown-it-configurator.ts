/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Configuration } from './markdown-it-configurator'
import { MarkdownItConfigurator } from './markdown-it-configurator'
import { headlineAnchors } from '../markdown-it-plugins/headline-anchors'
import type { LineMarkers } from '../replace-components/linemarker/line-number-marker'
import { lineNumberMarker } from '../replace-components/linemarker/line-number-marker'

export interface DocumentConfiguration extends Configuration {
  onLineMarkers?: (lineMarkers: LineMarkers[]) => void
}

export class DocumentMarkdownItConfigurator extends MarkdownItConfigurator<DocumentConfiguration> {
  protected configure(): void {
    super.configure()

    this.configurations.push(headlineAnchors)
    if (this.options.onLineMarkers) {
      this.configurations.push(lineNumberMarker(this.options.onLineMarkers, this.options.lineOffset ?? 0))
    }
  }
}
