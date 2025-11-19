/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasCreateInterface, AliasUpdateInterface } from '@hedgedoc/commons';
import request from 'supertest';

import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { TestSetup, TestSetupBuilder } from '../test-setup';
import { setupAgentUsers } from './utils/setup-agent-users';

describe('Alias', () => {
  let testSetup: TestSetup;

  let userIds: number[];
  const content = 'This is a test note.';
  let forbiddenNoteId: string;

  let agentGuestUser: request.SuperAgentTest;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    await testSetup.app.init();

    const agentUsers = await setupAgentUsers(testSetup);
    agentGuestUser = agentUsers.agentGuestUser;
    agentUser1 = agentUsers.agentUser1;
    agentUser2 = agentUsers.agentUser2;

    forbiddenNoteId =
      testSetup.configService.get('noteConfig').forbiddenNoteIds[0];
    userIds = testSetup.userIds;
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe(`POST ${PRIVATE_API_PREFIX}/alias`, () => {
    const testAlias = 'test-alias';
    const newAliasDto: AliasCreateInterface = {
      noteAlias: testAlias,
      newAlias: '',
    };

    let noteId: number = NaN;
    beforeAll(async () => {
      noteId = await testSetup.notesService.createNote(
        content,
        userIds[0],
        testAlias,
      );
    });

    it('creates a normal alias', async () => {
      const newAlias = 'new-alias';
      newAliasDto.newAlias = newAlias;

      await agentUser1
        .post(`${PRIVATE_API_PREFIX}/alias`)
        .set('Content-Type', 'application/json')
        .send(newAliasDto)
        .expect(201);
      const note = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/${newAlias}`)
        .expect(200);
      expect(note.body.metadata.aliases).toEqual([testAlias, newAlias]);
      expect(note.body.metadata.primaryAlias).toEqual(testAlias);
    });

    describe('does not create an alias', () => {
      it('because of a forbidden alias', async () => {
        newAliasDto.newAlias = forbiddenNoteId;

        await agentUser1
          .post(`${PRIVATE_API_PREFIX}/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(400)
          .then((response) => {
            expect(response.body.message).toContain(
              'is forbidden by the administrator',
            );
          });
      });

      it('because of an already existing alias', async () => {
        await testSetup.aliasService.addAlias(noteId, 'existingAlias');
        newAliasDto.newAlias = 'existing-alias';

        await agentUser1
          .post(`${PRIVATE_API_PREFIX}/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(409);
      });

      it('because the user is not the owner', async () => {
        newAliasDto.newAlias = 'normal-alias';

        await agentUser2
          .post(`${PRIVATE_API_PREFIX}/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(401);
      });
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/alias/:alias`, () => {
    const testAlias = 'test-alias2';
    const newAlias = 'normalAlias2';
    const changeAliasDto: AliasUpdateInterface = {
      primaryAlias: true,
    };
    let noteId: number = NaN;
    beforeAll(async () => {
      noteId = await testSetup.notesService.createNote(
        content,
        userIds[0],
        testAlias,
      );
      await testSetup.aliasService.addAlias(noteId, newAlias);
    });

    it('updates a note with a normal alias', async () => {
      const metadata = await agentUser1
        .put(`/api/private/alias/${newAlias}`)
        .set('Content-Type', 'application/json')
        .send(changeAliasDto)
        .expect(200);
      expect(metadata.body.name).toEqual(newAlias);
      expect(metadata.body.primaryAlias).toBeTruthy();
      expect(metadata.body.noteId).toEqual(noteId);
      const note = await agentUser1
        .get(`/api/private/notes/${newAlias}`)
        .expect(200);
      expect(note.body.metadata.aliases).toContainEqual({
        name: newAlias,
        primaryAlias: true,
        noteId: noteId,
      });
      expect(note.body.metadata.primaryAlias).toEqual(newAlias);
      expect(note.body.metadata.id).toEqual(noteId);
    });

    describe('does not update', () => {
      it('a note with unknown alias', async () => {
        await agentUser1
          .put(`/api/private/alias/i_dont_exist`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(404);
      });
      it('a note with a forbidden ID', async () => {
        await agentUser1
          .put(`/api/private/alias/${forbiddenNoteId}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(400)
          .then((response) => {
            expect(response.body.message).toContain(
              'is forbidden by the administrator',
            );
          });
      });
      it('if the property primaryAlias is false', async () => {
        await agentUser1
          .put(`/api/private/alias/${newAlias}`)
          .set('Content-Type', 'application/json')
          .send({
            primaryAlias: false,
          })
          .expect(400);
      });
      it('if the user is not an owner', async () => {
        changeAliasDto.primaryAlias = true;
        await agentUser2
          .put(`/api/private/alias/${newAlias}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(401);
      });
    });
  });

  describe('DELETE /alias/{alias}', () => {
    const testAlias = 'aliasTest3';
    const newAlias = 'normalAlias3';
    let noteId: number = NaN;

    beforeEach(async () => {
      noteId = await testSetup.notesService.createNote(
        content,
        userIds[0],
        testAlias,
      );
      await testSetup.aliasService.addAlias(noteId, newAlias);
    });

    afterEach(async () => {
      try {
        await testSetup.aliasService.removeAlias(newAlias);
        // Ignore errors on removing alias
        // eslint-disable-next-line no-empty
      } catch {}
      await testSetup.notesService.deleteNote(noteId);
    });

    it('deletes a normal alias', async () => {
      await agentUser1.delete(`/api/private/alias/${newAlias}`).expect(204);
      await agentUser1.get(`/api/private/notes/${newAlias}`).expect(404);
    });

    it('does not delete an unknown alias', async () => {
      await agentUser1.delete(`/api/private/alias/i_dont_exist`).expect(404);
    });

    it('does not delete an alias of a forbidden note', async () => {
      await agentUser1
        .delete(`/api/private/alias/${forbiddenNoteId}`)
        .expect(400)
        .then((response) => {
          expect(response.body.message).toContain(
            'is forbidden by the administrator',
          );
        });
    });

    it('fails if the user does not own the note', async () => {
      await agentUser2.delete(`/api/private/alias/${newAlias}`).expect(401);
    });

    it('does not delete an primary alias (if it is not the only one)', async () => {
      await agentUser1.delete(`/api/private/alias/${testAlias}`).expect(400);
      await agentUser1.get(`/api/private/notes/${newAlias}`).expect(200);
    });

    it('deletes a primary alias (if it is the only one)', async () => {
      await agentUser1.delete(`/api/private/alias/${newAlias}`).expect(204);
      await agentUser1.delete(`/api/private/alias/${testAlias}`).expect(204);
    });
  });
});
