/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IncomingMessage } from 'http';
import { Mock } from 'ts-mockery';

import { extractNoteAliasFromRequestUrl } from './extract-note-id-from-request-url';

describe('extract note id from path', () => {
  it('fails if no URL is present', () => {
    const mockedRequest = Mock.of<IncomingMessage>();
    expect(() => extractNoteAliasFromRequestUrl(mockedRequest)).toThrow('No URL found in request');
  });

  it('can find a note id', () => {
    const mockedRequest = Mock.of<IncomingMessage>({
      url: '/realtime?noteAlias=somethingsomething',
    });
    expect(extractNoteAliasFromRequestUrl(mockedRequest)).toBe(
      'somethingsomething',
    );
  });

  it('fails if no note id is present', () => {
    const mockedRequest = Mock.of<IncomingMessage>({
      url: '/realtime?nöteAlias=somethingsomething',
    });
    expect(() => extractNoteAliasFromRequestUrl(mockedRequest)).toThrow("Path doesn't contain parameter noteAlias");
  });

  it('fails if note id is empty', () => {
    const mockedRequest = Mock.of<IncomingMessage>({
      url: '/realtime?noteAlias=',
    });
    expect(() => extractNoteAliasFromRequestUrl(mockedRequest)).toThrow("Path doesn't contain parameter noteAlias");
  });

  it('fails if path is empty', () => {
    const mockedRequest = Mock.of<IncomingMessage>({
      url: '',
    });
    expect(() => extractNoteAliasFromRequestUrl(mockedRequest)).toThrow("Path doesn't contain parameter noteAlias");
  });
});
