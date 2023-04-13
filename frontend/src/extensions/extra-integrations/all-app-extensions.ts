/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BasicMarkdownSyntaxAppExtension } from '../../components/markdown-renderer/extensions/basic-markdown-syntax/basic-markdown-syntax-app-extension'
import { BootstrapIconAppExtension } from '../../components/markdown-renderer/extensions/bootstrap-icons/bootstrap-icon-app-extension'
import { EmojiAppExtension } from '../../components/markdown-renderer/extensions/emoji/emoji-app-extension'
import { ExtractFirstHeadlineAppExtension } from '../../components/markdown-renderer/extensions/extract-first-headline/extract-first-headline-app-extension'
import { IframeCapsuleAppExtension } from '../../components/markdown-renderer/extensions/iframe-capsule/iframe-capsule-app-extension'
import { ImagePlaceholderAppExtension } from '../../components/markdown-renderer/extensions/image-placeholder/image-placeholder-app-extension'
import { TableOfContentsAppExtension } from '../../components/markdown-renderer/extensions/table-of-contents/table-of-contents-app-extension'
import type { AppExtension } from '../base/app-extension'
import { AbcjsAppExtension } from './abcjs/abcjs-app-extension'
import { AlertAppExtension } from './alert/alert-app-extension'
import { AsciinemaAppExtension } from './asciinema/asciinema-app-extension'
import { BlockquoteAppExtension } from './blockquote/blockquote-app-extension'
import { CsvTableAppExtension } from './csv/csv-table-app-extension'
import { FlowchartAppExtension } from './flowchart/flowchart-app-extension'
import { ForkAwesomeHtmlTagAppExtension } from './fork-awesome-html-tag/fork-awesome-html-tag-app-extension'
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

const thirdPartyIntegrationAppExtensions: AppExtension[] = [
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

/**
 * This array defines additional app extensions that are used in the editor, read only page and slideshow.
 */
export const allAppExtensions: AppExtension[] = [
  ...thirdPartyIntegrationAppExtensions,
  new AlertAppExtension(),
  new BlockquoteAppExtension(),
  new CsvTableAppExtension(),
  new LegacyShortcodesAppExtension(),
  new LegacySequenceDiagramAppExtension(),
  new SpoilerAppExtension(),
  new TaskListCheckboxAppExtension(),
  new HighlightedCodeFenceAppExtension(),
  new ForkAwesomeHtmlTagAppExtension(),
  new BootstrapIconAppExtension(),
  new EmojiAppExtension(),
  new TableOfContentsAppExtension(),
  new ImagePlaceholderAppExtension(),
  new IframeCapsuleAppExtension(),
  new BasicMarkdownSyntaxAppExtension(),
  new ExtractFirstHeadlineAppExtension()
]
