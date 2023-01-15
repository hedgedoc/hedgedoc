/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Linter } from '../../../components/editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../components/editor-page/editor-pane/linter/single-line-regex-linter'
import { AppExtension } from '../../base/app-extension'
import { t } from 'i18next'

export const forkAwesomeRegex = /<i class=["']fa fa-[\w-]+["'](?: aria-hidden=["']true["'])?\/?>(?:<\/i>)?/

/**
 * Adds support for flow charts to the markdown rendering.
 */
export class ForkAwesomeAppExtension extends AppExtension {
  buildCodeMirrorLinter(): Linter[] {
    return [
      new SingleLineRegexLinter(
        forkAwesomeRegex,
        t('editor.linter.fork-awesome', { link: 'https://docs.hedgedoc.org' }) // ToDo: Add correct link here
      )
    ]
  }
}
