/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Configuration } from './markdown-it-configurator'
import { MarkdownItConfigurator } from './markdown-it-configurator'
import { addSlideSectionsMarkdownItPlugin } from '../markdown-it-plugins/reveal-sections'

export class SlideshowMarkdownItConfigurator extends MarkdownItConfigurator<Configuration> {
  protected configure(): void {
    super.configure()

    this.configurations.push(addSlideSectionsMarkdownItPlugin)
  }
}
