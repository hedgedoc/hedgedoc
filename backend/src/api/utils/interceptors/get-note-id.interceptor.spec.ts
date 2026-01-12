/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Note } from '@hedgedoc/database';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { Observable } from 'rxjs';
import { Mock } from 'ts-mockery';

import { NoteService } from '../../../notes/note.service';
import { CompleteRequest } from '../request.type';
import { GetNoteIdInterceptor } from './get-note-id.interceptor';

describe('get note interceptor', () => {
  const mockNote = Mock.of<Note>({});
  const mockNoteId = 'noteAlias';
  const mockObservable = Mock.of<Observable<unknown>>({});
  const nextCallHandler = Mock.of<CallHandler>({
    handle: () => mockObservable,
  });

  let notesService: NoteService;
  let noteFetchSpy: jest.SpyInstance;

  beforeEach(() => {
    notesService = Mock.of<NoteService>({
      getNoteIdByAlias: (id) => (id === mockNoteId ? Promise.resolve(mockNote) : Promise.reject()),
    });
    noteFetchSpy = jest.spyOn(notesService, 'getNoteIdByAlias');
  });

  function mockExecutionContext(request: CompleteRequest) {
    return Mock.of<ExecutionContext>({
      switchToHttp: () =>
        Mock.of<HttpArgumentsHost>({
          getRequest: () => request,
        }),
    });
  }

  it('extracts the note from the request headers', async () => {
    const request = Mock.of<CompleteRequest>({
      params: {},
      headers: { ['hedgedoc-note']: mockNoteId },
    });
    const context = mockExecutionContext(request);
    const sut: GetNoteIdInterceptor = new GetNoteIdInterceptor(notesService);
    const result = await sut.intercept(context, nextCallHandler);

    expect(result).toBe(mockObservable);
    expect(request.noteId).toBe(mockNote);
    expect(noteFetchSpy).toHaveBeenCalledTimes(1);
  });

  it('extracts the note from the request parameters', async () => {
    const request = Mock.of<CompleteRequest>({
      params: { noteAlias: mockNoteId },
    });
    const context = mockExecutionContext(request);
    const sut: GetNoteIdInterceptor = new GetNoteIdInterceptor(notesService);
    const result = await sut.intercept(context, nextCallHandler);

    expect(result).toBe(mockObservable);
    expect(request.noteId).toBe(mockNote);
    expect(noteFetchSpy).toHaveBeenCalledTimes(1);
  });

  it('works if no note id is in the request', async () => {
    const request = Mock.of<CompleteRequest>({
      params: {},
      headers: {},
    });

    const context = mockExecutionContext(request);
    const sut: GetNoteIdInterceptor = new GetNoteIdInterceptor(notesService);
    const result = await sut.intercept(context, nextCallHandler);

    expect(result).toBe(mockObservable);
    expect(request.noteId).toBe(undefined);
    expect(noteFetchSpy).toHaveBeenCalledTimes(0);
  });
});
