/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { NotesService } from '../../notes/notes.service';
import { extractNoteFromRequest } from './extract-note-from-request';
import { CompleteRequest } from './request.type';

describe('extract note from request', () => {
  const mockNoteIdOrAlias1 = 'mockNoteIdOrAlias1';
  const mockNoteIdOrAlias2 = 'mockNoteIdOrAlias2';

  const mockNote1 = Mock.of<Note>({ id: 1 });
  const mockNote2 = Mock.of<Note>({ id: 2 });

  let notesService: NotesService;

  beforeEach(() => {
    notesService = Mock.of<NotesService>({
      getNoteByIdOrAlias: async (id) => {
        if (id === mockNoteIdOrAlias1) {
          return mockNote1;
        } else if (id === mockNoteIdOrAlias2) {
          return mockNote2;
        } else {
          throw new Error('unknown note id');
        }
      },
    });
  });

  function createRequest(
    parameterValue: string | undefined,
    headerValue: string | string[] | undefined,
  ): CompleteRequest {
    return Mock.of<CompleteRequest>({
      params: parameterValue
        ? {
            noteIdOrAlias: parameterValue,
          }
        : {},
      headers: headerValue
        ? {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'hedgedoc-note': headerValue,
          }
        : {},
    });
  }

  it('will return undefined if no id is present', async () => {
    const request = createRequest(undefined, undefined);
    expect(await extractNoteFromRequest(request, notesService)).toBe(undefined);
  });

  it('can extract an id from parameters', async () => {
    const request = createRequest(mockNoteIdOrAlias1, undefined);
    expect(await extractNoteFromRequest(request, notesService)).toBe(mockNote1);
  });

  it('can extract an id from headers if no parameter is given', async () => {
    const request = createRequest(undefined, mockNoteIdOrAlias1);
    expect(await extractNoteFromRequest(request, notesService)).toBe(mockNote1);
  });

  it('can extract the first id from multiple id headers', async () => {
    const request = createRequest(undefined, [
      mockNoteIdOrAlias1,
      mockNoteIdOrAlias2,
    ]);
    expect(await extractNoteFromRequest(request, notesService)).toBe(mockNote1);
  });

  it('will return undefined if no parameter and empty id header array', async () => {
    const request = createRequest(undefined, []);
    expect(await extractNoteFromRequest(request, notesService)).toBe(undefined);
  });

  it('will prefer the parameter over the header', async () => {
    const request = createRequest(mockNoteIdOrAlias1, mockNoteIdOrAlias2);
    expect(await extractNoteFromRequest(request, notesService)).toBe(mockNote1);
  });
});
