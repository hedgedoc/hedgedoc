/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MARKDOWN_CONTENT_CHANNEL_NAME } from '@hedgedoc/commons';
import { Doc } from 'yjs';

/**
 * This is the implementation of {@link Doc YDoc} which includes additional handlers for message sending and receiving.
 */
export class ExtendedDoc extends Doc {
  /**
   * Creates a new WebsocketDoc instance.
   *
   * The new instance is filled with the given initial content and an event listener will be registered to handle
   * updates to the doc.
   *
   * @param initialContent - the initial content of the {@link Doc YDoc}
   */
  constructor(initialContent: string) {
    super();
    this.getText(MARKDOWN_CONTENT_CHANNEL_NAME).insert(0, initialContent);
  }

  /**
   * Gets the current content of the note as it's currently edited in realtime.
   *
   * Please be aware that the return of this method may be very quickly outdated.
   *
   * @return The current note content.
   */
  public getCurrentContent(): string {
    return this.getText(MARKDOWN_CONTENT_CHANNEL_NAME).toString();
  }
}
