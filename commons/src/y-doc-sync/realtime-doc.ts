/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventEmitter2 } from 'eventemitter2'
import type { EventMap } from 'eventemitter2'
import {
  applyUpdate,
  Doc,
  encodeStateAsUpdate,
  encodeStateVector,
  Text as YText,
} from 'yjs'

const MARKDOWN_CONTENT_CHANNEL_NAME = 'markdownContent'

export interface RealtimeDocEvents extends EventMap {
  update: (update: number[], origin: unknown) => void
}

/**
 * This is the implementation of {@link Doc YDoc} which includes additional handlers for message sending and receiving.
 */
export class RealtimeDoc extends EventEmitter2<RealtimeDocEvents> {
  private doc: Doc = new Doc()
  private readonly docUpdateListener: (
    update: Uint8Array,
    origin: unknown,
  ) => void

  /**
   * Creates a new instance.
   *
   * The new instance is filled with the given initial content.
   *
   * @param initialTextContent the initial text content of the {@link Doc YDoc}
   * @param initialYjsState the initial yjs state. If provided this will be used instead of the text content
   */
  constructor(initialTextContent?: string, initialYjsState?: number[]) {
    super()
    if (initialYjsState) {
      this.applyUpdate(initialYjsState, this)
    } else if (initialTextContent) {
      this.getMarkdownContentChannel().insert(0, initialTextContent)
    }

    this.docUpdateListener = (update, origin) => {
      this.emit('update', Array.from(update), origin)
    }
    this.doc.on('update', this.docUpdateListener)
  }

  /**
   * Extracts the {@link YText text channel} that contains the markdown code.
   *
   * @return The markdown channel
   */
  public getMarkdownContentChannel(): YText {
    return this.doc.getText(MARKDOWN_CONTENT_CHANNEL_NAME)
  }

  /**
   * Gets the current content of the note as it's currently edited in realtime.
   *
   * Please be aware that the return of this method may be very quickly outdated.
   *
   * @return The current note content.
   */
  public getCurrentContent(): string {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return this.getMarkdownContentChannel().toString()
  }

  /**
   * Encodes the current state of the doc as update so it can be applied to other y-docs.
   *
   * @param encodedTargetStateVector The current state vector of the other y-doc. If provided the update will contain only the differences.
   */
  public encodeStateAsUpdate(encodedTargetStateVector?: number[]): number[] {
    const update = encodedTargetStateVector
      ? new Uint8Array(encodedTargetStateVector)
      : undefined
    return Array.from(encodeStateAsUpdate(this.doc, update))
  }

  public destroy(): void {
    this.doc.off('update', this.docUpdateListener)
    this.doc.destroy()
  }

  /**
   * Applies an update to the y-doc.
   *
   * @param payload The update to apply
   * @param origin A reference that triggered the update
   */
  public applyUpdate(payload: number[], origin: unknown): void {
    applyUpdate(this.doc, new Uint8Array(payload), origin)
  }

  public encodeStateVector(): number[] {
    return Array.from(encodeStateVector(this.doc))
  }
}
