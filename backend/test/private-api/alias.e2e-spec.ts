/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasCreateDto, AliasUpdateDto } from '@hedgedoc/commons';
import request from 'supertest';

import { Note } from '../../src/notes/note.entity';
import { User } from '../../src/users/user.entity';
import {
  password1,
  password2,
  TestSetup,
  TestSetupBuilder,
  username1,
  username2,
} from '../test-setup';

describe('Alias', () => {
  let testSetup: TestSetup;

  let users: User[];
  const content = 'This is a test note.';
  let forbiddenNoteId: string;

  let agent1: request.SuperAgentTest;
  let agent2: request.SuperAgentTest;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    await testSetup.app.init();

    forbiddenNoteId =
      testSetup.configService.get('noteConfig').forbiddenNoteIds[0];
    users = testSetup.users;

    agent1 = request.agent(testSetup.app.getHttpServer());
    await agent1
      .post('/api/private/auth/local/login')
      .send({ username: username1, password: password1 })
      .expect(201);

    agent2 = request.agent(testSetup.app.getHttpServer());
    await agent2
      .post('/api/private/auth/local/login')
      .send({ username: username2, password: password2 })
      .expect(201);
  });

  afterAll(async () => {
    await testSetup.cleanup();
  });

  describe('POST /alias', () => {
    const testAlias = 'aliasTest';
    const newAliasDto: AliasCreateDto = {
      noteIdOrAlias: testAlias,
      newAlias: '',
    };
    let publicId = '';
    beforeAll(async () => {
      const note = await testSetup.notesService.createNote(
        content,
        users[0],
        testAlias,
      );
      publicId = note.publicId;
    });

    it('create with normal alias', async () => {
      const newAlias = 'normalAlias';
      newAliasDto.newAlias = newAlias;
      const metadata = await agent1
        .post(`/api/private/alias`)
        .set('Content-Type', 'application/json')
        .send(newAliasDto)
        .expect(201);
      expect(metadata.body.name).toEqual(newAlias);
      expect(metadata.body.primaryAlias).toBeFalsy();
      expect(metadata.body.noteId).toEqual(publicId);
      const note = await agent1
        .get(`/api/private/notes/${newAlias}`)
        .expect(200);
      expect(note.body.metadata.aliases).toContainEqual({
        name: 'normalAlias',
        primaryAlias: false,
        noteId: publicId,
      });
      expect(note.body.metadata.primaryAddress).toEqual(testAlias);
      expect(note.body.metadata.id).toEqual(publicId);
    });

    describe('does not create an alias', () => {
      it('because of a forbidden alias', async () => {
        newAliasDto.newAlias = forbiddenNoteId;
        await agent1
          .post(`/api/private/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(400)
          .then((response) => {
            expect(response.body.message).toContain(
              'is forbidden by the administrator',
            );
          });
      });
      it('because of a alias that is a public id', async () => {
        newAliasDto.newAlias = publicId;
        await agent1
          .post(`/api/private/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(409);
      });
      it('because the user is not an owner', async () => {
        newAliasDto.newAlias = publicId;
        await agent2
          .post(`/api/private/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(401);
      });
    });
  });

  describe('PUT /alias/{alias}', () => {
    const testAlias = 'aliasTest2';
    const newAlias = 'normalAlias2';
    const changeAliasDto: AliasUpdateDto = {
      primaryAlias: true,
    };
    let publicId = '';
    beforeAll(async () => {
      const note = await testSetup.notesService.createNote(
        content,
        users[0],
        testAlias,
      );
      publicId = note.publicId;
      await testSetup.aliasService.addAlias(note, newAlias);
    });

    it('updates a note with a normal alias', async () => {
      const metadata = await agent1
        .put(`/api/private/alias/${newAlias}`)
        .set('Content-Type', 'application/json')
        .send(changeAliasDto)
        .expect(200);
      expect(metadata.body.name).toEqual(newAlias);
      expect(metadata.body.primaryAlias).toBeTruthy();
      expect(metadata.body.noteId).toEqual(publicId);
      const note = await agent1
        .get(`/api/private/notes/${newAlias}`)
        .expect(200);
      expect(note.body.metadata.aliases).toContainEqual({
        name: newAlias,
        primaryAlias: true,
        noteId: publicId,
      });
      expect(note.body.metadata.primaryAddress).toEqual(newAlias);
      expect(note.body.metadata.id).toEqual(publicId);
    });

    describe('does not update', () => {
      it('a note with unknown alias', async () => {
        await agent1
          .put(`/api/private/alias/i_dont_exist`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(404);
      });
      it('a note with a forbidden ID', async () => {
        await agent1
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
        await agent1
          .put(`/api/private/alias/${newAlias}`)
          .set('Content-Type', 'application/json')
          .send({
            primaryAlias: false,
          })
          .expect(400);
      });
      it('if the user is not an owner', async () => {
        changeAliasDto.primaryAlias = true;
        await agent2
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
    let note: Note;

    beforeEach(async () => {
      note = await testSetup.notesService.createNote(
        content,
        users[0],
        testAlias,
      );
      await testSetup.aliasService.addAlias(note, newAlias);
    });

    afterEach(async () => {
      try {
        await testSetup.aliasService.removeAlias(note, newAlias);
        // Ignore errors on removing alias
        // eslint-disable-next-line no-empty
      } catch {}
      await testSetup.notesService.deleteNote(note);
    });

    it('deletes a normal alias', async () => {
      await agent1.delete(`/api/private/alias/${newAlias}`).expect(204);
      await agent1.get(`/api/private/notes/${newAlias}`).expect(404);
    });

    it('does not delete an unknown alias', async () => {
      await agent1.delete(`/api/private/alias/i_dont_exist`).expect(404);
    });

    it('does not delete an alias of a forbidden note', async () => {
      await agent1
        .delete(`/api/private/alias/${forbiddenNoteId}`)
        .expect(400)
        .then((response) => {
          expect(response.body.message).toContain(
            'is forbidden by the administrator',
          );
        });
    });

    it('fails if the user does not own the note', async () => {
      await agent2.delete(`/api/private/alias/${newAlias}`).expect(401);
    });

    it('does not delete an primary alias (if it is not the only one)', async () => {
      await agent1.delete(`/api/private/alias/${testAlias}`).expect(400);
      await agent1.get(`/api/private/notes/${newAlias}`).expect(200);
    });

    it('deletes a primary alias (if it is the only one)', async () => {
      await agent1.delete(`/api/private/alias/${newAlias}`).expect(204);
      await agent1.delete(`/api/private/alias/${testAlias}`).expect(204);
    });
  });
});
