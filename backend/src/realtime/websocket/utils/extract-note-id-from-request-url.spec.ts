/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IncomingMessage } from 'http';
import { Mock } from 'ts-mockery';

import { extractNoteIdFromRequestUrl } from './extract-note-id-from-request-url';

describe('extract note id from path', () => {
  it('fails if no URL is present', () => {
    const mockedRequest = Mock.of<IncomingMessage>();
    expect(() => extractNoteIdFromRequestUrl(mockedRequest)).toThrow();
  });

  it('can find a note id', () => {
    const mockedRequest = Mock.of<IncomingMessage>({
      url: '/realtime?noteId=somethingsomething',
    });
    expect(extractNoteIdFromRequestUrl(mockedRequest)).toBe(
      'somethingsomething',
    );
  });

  it('fails if no note id is present', () => {
    const mockedRequest = Mock.of<IncomingMessage>({
      url: '/realtime?nöteId=somethingsomething',
    });
    expect(() => extractNoteIdFromRequestUrl(mockedRequest)).toThrow();
  });

  it('fails if note id is empty', () => {
    const mockedRequest = Mock.of<IncomingMessage>({
      url: '/realtime?noteId=',
    });
    expect(() => extractNoteIdFromRequestUrl(mockedRequest)).toThrow();
  });

  it('fails if path is empty', () => {
    const mockedRequest = Mock.of<IncomingMessage>({
      url: '',
    });
    expect(() => extractNoteIdFromRequestUrl(mockedRequest)).toThrow();
  });
});
