/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from './markdown-renderer-extension'
import type { EventEmitter2 } from 'eventemitter2'

/**
 * Base class for Markdown renderer extensions that need an event emitter.
 */
export abstract class EventMarkdownRendererExtension extends MarkdownRendererExtension {
  constructor(protected readonly eventEmitter: EventEmitter2) {
    super()
  }
}
