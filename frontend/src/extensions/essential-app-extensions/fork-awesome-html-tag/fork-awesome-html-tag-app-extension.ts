/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Linter } from '../../../components/editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../components/editor-page/editor-pane/linter/single-line-regex-linter'
import { AppExtension } from '../../_base-classes/app-extension'
import { t } from 'i18next'

const forkAwesomeRegex = /<i class=["'][\w\s]*fa-[\w-]+[\w\s-]*["'][^>]*\/?>(?:<\/i>)?/

/**
 * Adds a linter for the icon html tag.
 */
export class ForkAwesomeHtmlTagAppExtension extends AppExtension {
  buildCodeMirrorLinter(): Linter[] {
    return [
      new SingleLineRegexLinter(
        forkAwesomeRegex,
        t('editor.linter.fork-awesome', { link: 'https://docs.hedgedoc.dev/faq/#why-are-forkawesome-icons-deprecated' })
      )
    ]
  }
}
