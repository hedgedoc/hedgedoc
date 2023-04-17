/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LegacySequenceDiagramAppExtension } from '../external-lib-app-extensions/sequence-diagram/legacy-sequence-diagram-app-extension'
import { AlertAppExtension } from './alert/alert-app-extension'
import { BasicMarkdownSyntaxAppExtension } from './basic-markdown-syntax/basic-markdown-syntax-app-extension'
import { BlockquoteAppExtension } from './blockquote/blockquote-app-extension'
import { BootstrapIconAppExtension } from './bootstrap-icons/bootstrap-icon-app-extension'
import { CsvTableAppExtension } from './csv/csv-table-app-extension'
import { EmojiAppExtension } from './emoji/emoji-app-extension'
import { ExtractFirstHeadlineAppExtension } from './extract-first-headline/extract-first-headline-app-extension'
import { ForkAwesomeHtmlTagAppExtension } from './fork-awesome-html-tag/fork-awesome-html-tag-app-extension'
import { HeadlineAnchorsAppExtension } from './headline-anchors/headline-anchors-app-extension'
import { HighlightedCodeFenceAppExtension } from './highlighted-code-fence/highlighted-code-fence-app-extension'
import { IframeCapsuleAppExtension } from './iframe-capsule/iframe-capsule-app-extension'
import { ImagePlaceholderAppExtension } from './image-placeholder/image-placeholder-app-extension'
import { LegacyShortcodesAppExtension } from './legacy-short-codes/legacy-shortcodes-app-extension'
import { SpoilerAppExtension } from './spoiler/spoiler-app-extension'
import { TableOfContentsAppExtension } from './table-of-contents/table-of-contents-app-extension'
import { TaskListCheckboxAppExtension } from './task-list/task-list-checkbox-app-extension'

/**
 * Contains all app extensions that are adding essential features or additional features developed by the HedgeDoc maintainers.
 */
export const essentialAppExtensions = [
  new AlertAppExtension(),
  new BasicMarkdownSyntaxAppExtension(),
  new BlockquoteAppExtension(),
  new BootstrapIconAppExtension(),
  new CsvTableAppExtension(),
  new EmojiAppExtension(),
  new ExtractFirstHeadlineAppExtension(),
  new ForkAwesomeHtmlTagAppExtension(),
  new HighlightedCodeFenceAppExtension(),
  new IframeCapsuleAppExtension(),
  new ImagePlaceholderAppExtension(),
  new LegacyShortcodesAppExtension(),
  new SpoilerAppExtension(),
  new TableOfContentsAppExtension(),
  new TaskListCheckboxAppExtension(),
  new HeadlineAnchorsAppExtension(),
  new LegacySequenceDiagramAppExtension()
]
