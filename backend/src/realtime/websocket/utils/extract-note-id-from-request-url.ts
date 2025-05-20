/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IncomingMessage } from 'http';

/**
 * Extracts the note id from the url of the given request.
 *
 * @param request The request whose URL should be extracted
 * @returns The extracted note id
 * @throws Error if the given string isn't a valid realtime URL path
 */
export function extractNoteAliasFromRequestUrl(
  request: IncomingMessage,
): string {
  if (request.url === undefined) {
    throw new Error('No URL found in request');
  }
  // A valid domain name is needed for the URL constructor, although not being used here.
  // The example.org domain should be safe to use, according to RFC 6761 §6.5.
  const url = new URL(request.url, 'https://example.org');
  const noteAlias = url.searchParams.get('noteAlias');
  if (noteAlias === null || noteAlias === '') {
    throw new Error("Path doesn't contain parameter noteAlias");
  } else {
    return noteAlias;
  }
}
