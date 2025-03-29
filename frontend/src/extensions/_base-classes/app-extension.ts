/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfigDto } from '@hedgedoc/commons'
import type { CheatsheetExtension } from '../../components/cheatsheet/cheatsheet-extension'
import type { Linter } from '../../components/editor-page/editor-pane/linter/linter'
import type { MarkdownRendererExtension } from '../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { RendererType } from '../../components/render-page/window-post-message-communicator/rendering-message'
import type { CompletionSource } from '@codemirror/autocomplete'
import type { EventEmitter2 } from 'eventemitter2'
import type React from 'react'
import { Fragment } from 'react'

export interface MarkdownRendererExtensionOptions {
  frontendConfig: FrontendConfigDto
  eventEmitter: EventEmitter2
  rendererType: RendererType
}

export abstract class AppExtension {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public buildMarkdownRendererExtensions(options: MarkdownRendererExtensionOptions): MarkdownRendererExtension[] {
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
