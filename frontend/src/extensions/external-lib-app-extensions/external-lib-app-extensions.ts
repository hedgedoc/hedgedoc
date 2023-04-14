/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AppExtension } from '../_base-classes/app-extension'
import { AbcjsAppExtension } from './abcjs/abcjs-app-extension'
import { AsciinemaAppExtension } from './asciinema/asciinema-app-extension'
import { FlowchartAppExtension } from './flowchart/flowchart-app-extension'
import { GistAppExtension } from './gist/gist-app-extension'
import { GraphvizAppExtension } from './graphviz/graphviz-app-extension'
import { KatexAppExtension } from './katex/katex-app-extension'
import { MermaidAppExtension } from './mermaid/mermaid-app-extension'
import { PlantumlAppExtension } from './plantuml/plantuml-app-extension'
import { VegaLiteAppExtension } from './vega-lite/vega-lite-app-extension'
import { VimeoAppExtension } from './vimeo/vimeo-app-extension'
import { YoutubeAppExtension } from './youtube/youtube-app-extension'

/**
 * Contains all app extensions that add third party libraries.
 */
export const externalLibAppExtensions: AppExtension[] = [
  new AbcjsAppExtension(),
  new FlowchartAppExtension(),
  new GistAppExtension(),
  new GraphvizAppExtension(),
  new KatexAppExtension(),
  new AsciinemaAppExtension(),
  new MermaidAppExtension(),
  new PlantumlAppExtension(),
  new VegaLiteAppExtension(),
  new VimeoAppExtension(),
  new YoutubeAppExtension()
]
