/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Doc } from 'yjs'
import { Text as YText } from 'yjs'

const MARKDOWN_CONTENT_CHANNEL_NAME = 'markdownContent'

/**
 * This is the implementation of {@link Doc YDoc} which includes additional handlers for message sending and receiving.
 */
export class RealtimeDoc extends Doc {
  /**
   * Creates a new instance.
   *
   * The new instance is filled with the given initial content.
   *
   * @param initialContent - the initial content of the {@link Doc YDoc}
   */
  constructor(initialContent?: string) {
    super()
    if (initialContent) {
      this.getMarkdownContentChannel().insert(0, initialContent)
    }
  }

  /**
   * Extracts the {@link YText text channel} that contains the markdown code.
   *
   * @return The markdown channel
   */
  public getMarkdownContentChannel(): YText {
    return this.getText(MARKDOWN_CONTENT_CHANNEL_NAME)
  }

  /**
   * Gets the current content of the note as it's currently edited in realtime.
   *
   * Please be aware that the return of this method may be very quickly outdated.
   *
   * @return The current note content.
   */
  public getCurrentContent(): string {
    return this.getMarkdownContentChannel().toString()
  }
}
