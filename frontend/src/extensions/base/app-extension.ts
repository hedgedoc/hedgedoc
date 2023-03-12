/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../components/editor-page/cheatsheet/cheatsheet-extension'
import type { Linter } from '../../components/editor-page/editor-pane/linter/linter'
import type { MarkdownRendererExtension } from '../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import type { EventEmitter2 } from 'eventemitter2'
import type React from 'react'
import { Fragment } from 'react'

export abstract class AppExtension {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public buildMarkdownRendererExtensions(eventEmitter?: EventEmitter2): MarkdownRendererExtension[] {
    return []
  }

  public buildCodeMirrorLinter(): Linter[] {
    return []
  }

  public buildEditorExtensionComponent(): React.FC {
    return Fragment
  }

  public buildCheatsheetExtensions(): CheatsheetExtension[] {
    return []
  }

  public buildAutocompletion(): CompletionSource[] {
    return []
  }
}
