/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { Observable } from 'rxjs';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { NotesService } from '../../notes/notes.service';
import { GetNoteInterceptor } from './get-note.interceptor';
import { CompleteRequest } from './request.type';

describe('get note interceptor', () => {
  const mockNote = Mock.of<Note>({});
  const mockNoteId = 'noteIdOrAlias';
  const mockObservable = Mock.of<Observable<unknown>>({});
  const nextCallHandler = Mock.of<CallHandler>({
    handle: () => mockObservable,
  });

  let notesService: NotesService;
  let noteFetchSpy: jest.SpyInstance;

  beforeEach(() => {
    notesService = Mock.of<NotesService>({
      getNoteByIdOrAlias: (id) =>
        id === mockNoteId ? Promise.resolve(mockNote) : Promise.reject(),
    });
    noteFetchSpy = jest.spyOn(notesService, 'getNoteByIdOrAlias');
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
    const sut: GetNoteInterceptor = new GetNoteInterceptor(notesService);
    const result = await sut.intercept(context, nextCallHandler);

    expect(result).toBe(mockObservable);
    expect(request.note).toBe(mockNote);
    expect(noteFetchSpy).toHaveBeenCalledTimes(1);
  });

  it('extracts the note from the request parameters', async () => {
    const request = Mock.of<CompleteRequest>({
      params: { noteIdOrAlias: mockNoteId },
    });
    const context = mockExecutionContext(request);
    const sut: GetNoteInterceptor = new GetNoteInterceptor(notesService);
    const result = await sut.intercept(context, nextCallHandler);

    expect(result).toBe(mockObservable);
    expect(request.note).toBe(mockNote);
    expect(noteFetchSpy).toHaveBeenCalledTimes(1);
  });

  it('works if no note id is in the request', async () => {
    const request = Mock.of<CompleteRequest>({
      params: {},
      headers: {},
    });

    const context = mockExecutionContext(request);
    const sut: GetNoteInterceptor = new GetNoteInterceptor(notesService);
    const result = await sut.intercept(context, nextCallHandler);

    expect(result).toBe(mockObservable);
    expect(request.note).toBe(undefined);
    expect(noteFetchSpy).toHaveBeenCalledTimes(0);
  });
});
