/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasUpdateDto } from '@hedgedoc/commons';
import request from 'supertest';

import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Alias', () => {
  let testSetup: TestSetup;

  let forbiddenNoteId: string;
  let testAlias: string;
  let publicId: string;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    forbiddenNoteId =
      testSetup.configService.get('noteConfig').forbiddenNoteIds[0];

    await testSetup.app.init();

    testAlias = (await testSetup.ownedNotes[0].aliases)[0].name;
    publicId = testSetup.ownedNotes[0].publicId;
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe('POST /alias', () => {
    it('create with normal alias', async () => {
      const metadata = await request(testSetup.app.getHttpServer())
        .post(`/api/v2/alias`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'application/json')
        .send({
          noteIdOrAlias: testAlias,
          newAlias: 'normalAlias',
        })
        .expect(201);

      expect(metadata.body.name).toEqual('normalAlias');
      expect(metadata.body.primaryAlias).toBeFalsy();
      expect(metadata.body.noteId).toEqual(publicId);

      const note = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/normalAlias`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
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
      it('because because it is already used', async () => {
        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send({
            noteIdOrAlias: testAlias,
            newAlias: 'testAlias1',
          })
          .expect(409);
      });
      it('because of a forbidden alias', async () => {
        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send({
            noteIdOrAlias: testAlias,
            newAlias: forbiddenNoteId,
          })
          .expect(400);
      });
      it('because of a alias that is a public id', async () => {
        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send({
            noteIdOrAlias: testAlias,
            newAlias: publicId,
          })
          .expect(409);
      });
      it('because the user is not an owner', async () => {
        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
          .set('Content-Type', 'application/json')
          .send({
            noteIdOrAlias: testAlias,
            newAlias: '',
          })
          .expect(401);
      });
    });
  });

  describe('PUT /alias/{alias}', () => {
    const changeAliasDto: AliasUpdateDto = {
      primaryAlias: true,
    };

    it('updates a note with a normal alias', async () => {
      const metadata = await request(testSetup.app.getHttpServer())
        .put(`/api/v2/alias/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'application/json')
        .send(changeAliasDto)
        .expect(200);

      expect(metadata.body.name).toEqual(testAlias);
      expect(metadata.body.primaryAlias).toBeTruthy();
      expect(metadata.body.noteId).toEqual(publicId);

      const note = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);

      expect(note.body.metadata.aliases).toContainEqual({
        name: testAlias,
        primaryAlias: true,
        noteId: publicId,
      });
      expect(note.body.metadata.primaryAddress).toEqual(testAlias);
      expect(note.body.metadata.id).toEqual(publicId);
    });

    describe('does not update', () => {
      it('a note with unknown alias', async () => {
        await request(testSetup.app.getHttpServer())
          .put(`/api/v2/alias/i_dont_exist`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(404);
      });
      it('a note with a forbidden id', async () => {
        await request(testSetup.app.getHttpServer())
          .put(`/api/v2/alias/${forbiddenNoteId}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(400);
      });
      it('if the user is not an owner', async () => {
        await request(testSetup.app.getHttpServer())
          .put(`/api/v2/alias/${testAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(401);
      });
      it('if the property primaryAlias is false', async () => {
        await request(testSetup.app.getHttpServer())
          .put(`/api/v2/alias/${testAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send({
            primaryAlias: false,
          })
          .expect(400);
      });
    });
  });

  describe('DELETE /alias/{alias}', () => {
    const secondAlias = 'secondAlias';

    it('deletes a normal alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);

      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(404);
    });

    it('does not delete an unknown alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/i_dont_exist`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(404);
    });

    it('errors on forbidden notes', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${forbiddenNoteId}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(400);
    });

    it('errors if the user is not the owner', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(401);
    });

    it('does not delete a primary alias (if it is not the only one)', async () => {
      // add another alias
      await testSetup.aliasService.addAlias(
        testSetup.ownedNotes[0],
        secondAlias,
      );

      // try to delete the primary alias
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(400);
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${secondAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);
    });

    it('deletes a primary alias (if it is the only one)', async () => {
      // add another alias
      await testSetup.aliasService.addAlias(
        testSetup.ownedNotes[0],
        secondAlias,
      );

      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${secondAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);

      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);
    });
  });
});
