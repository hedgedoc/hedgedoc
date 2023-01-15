/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AppExtension } from '../base/app-extension'
import { AbcjsAppExtension } from './abcjs/abcjs-app-extension'
import { AlertAppExtension } from './alert/alert-app-extension'
import { BlockquoteAppExtension } from './blockquote/blockquote-app-extension'
import { CsvTableAppExtension } from './csv/csv-table-app-extension'
import { FlowchartAppExtension } from './flowchart/flowchart-app-extension'
import { ForkAwesomeAppExtension } from './fork-awesome/fork-awesome-app-extension'
import { GistAppExtension } from './gist/gist-app-extension'
import { GraphvizAppExtension } from './graphviz/graphviz-app-extension'
import { HighlightedCodeFenceAppExtension } from './highlighted-code-fence/highlighted-code-fence-app-extension'
import { KatexAppExtension } from './katex/katex-app-extension'
import { LegacyShortcodesAppExtension } from './legacy-short-codes/legacy-shortcodes-app-extension'
import { MermaidAppExtension } from './mermaid/mermaid-app-extension'
import { PlantumlAppExtension } from './plantuml/plantuml-app-extension'
import { LegacySequenceDiagramAppExtension } from './sequence-diagram/legacy-sequence-diagram-app-extension'
import { SpoilerAppExtension } from './spoiler/spoiler-app-extension'
import { TaskListCheckboxAppExtension } from './task-list/task-list-checkbox-app-extension'
import { VegaLiteAppExtension } from './vega-lite/vega-lite-app-extension'
import { VimeoAppExtension } from './vimeo/vimeo-app-extension'
import { YoutubeAppExtension } from './youtube/youtube-app-extension'

/**
 * This array defines additional app extensions that are used in the editor, read only page and slideshow.
 */
export const optionalAppExtensions: AppExtension[] = [
  new AbcjsAppExtension(),
  new AlertAppExtension(),
  new BlockquoteAppExtension(),
  new CsvTableAppExtension(),
  new FlowchartAppExtension(),
  new GistAppExtension(),
  new GraphvizAppExtension(),
  new KatexAppExtension(),
  new LegacyShortcodesAppExtension(),
  new MermaidAppExtension(),
  new PlantumlAppExtension(),
  new LegacySequenceDiagramAppExtension(),
  new SpoilerAppExtension(),
  new VegaLiteAppExtension(),
  new VimeoAppExtension(),
  new YoutubeAppExtension(),
  new TaskListCheckboxAppExtension(),
  new HighlightedCodeFenceAppExtension(),
  new ForkAwesomeAppExtension()
]
