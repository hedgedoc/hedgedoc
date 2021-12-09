/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import { AliasCreateDto } from '../../src/notes/alias-create.dto';
import { AliasUpdateDto } from '../../src/notes/alias-update.dto';
import { User } from '../../src/users/user.entity';
import { TestSetup } from '../test-setup';

describe('Alias', () => {
  let testSetup: TestSetup;

  const content = 'This is a test note.';
  let forbiddenNoteId: string;

  beforeAll(async () => {
    testSetup = await (await TestSetup.create(false)).withUsers();
    forbiddenNoteId =
      testSetup.configService.get('appConfig').forbiddenNoteIds[0];

    await testSetup.app.init();
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
        testSetup.users[0],
        testAlias,
      );
      publicId = note.publicId;
    });

    it('create with normal alias', async () => {
      const newAlias = 'normalAlias';
      newAliasDto.newAlias = newAlias;

      const metadata = await request(testSetup.app.getHttpServer())
        .post(`/api/v2/alias`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'application/json')
        .send(newAliasDto)
        .expect(201);

      expect(metadata.body.name).toEqual(newAlias);
      expect(metadata.body.primaryAlias).toBeFalsy();
      expect(metadata.body.noteId).toEqual(publicId);

      const note = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${newAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);

      expect(note.body.metadata.aliases).toContain(newAlias);
      expect(note.body.metadata.primaryAlias).toBeTruthy();
      expect(note.body.metadata.id).toEqual(publicId);
    });

    describe('does not create an alias', () => {
      it('because of a forbidden alias', async () => {
        newAliasDto.newAlias = forbiddenNoteId;

        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(400);
      });
      it('because of a alias that is a public id', async () => {
        newAliasDto.newAlias = publicId;

        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(400);
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
        testSetup.users[0],
        testAlias,
      );
      publicId = note.publicId;
      await testSetup.aliasService.addAlias(note, newAlias);
    });

    it('updates a note with a normal alias', async () => {
      const metadata = await request(testSetup.app.getHttpServer())
        .put(`/api/v2/alias/${newAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'application/json')
        .send(changeAliasDto)
        .expect(200);

      expect(metadata.body.name).toEqual(newAlias);
      expect(metadata.body.primaryAlias).toBeTruthy();
      expect(metadata.body.noteId).toEqual(publicId);

      const note = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${newAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);

      expect(note.body.metadata.aliases).toContain(newAlias);
      expect(note.body.metadata.primaryAlias).toBeTruthy();
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
      it('if the property primaryAlias is false', async () => {
        changeAliasDto.primaryAlias = false;

        await request(testSetup.app.getHttpServer())
          .put(`/api/v2/alias/${newAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(400);
      });
    });
  });

  describe('DELETE /alias/{alias}', () => {
    const testAlias = 'aliasTest3';
    const newAlias = 'normalAlias3';
    beforeAll(async () => {
      const note = await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        testAlias,
      );
      await testSetup.aliasService.addAlias(note, newAlias);
    });

    it('deletes a normal alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${newAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);

      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${newAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(404);
    });

    it('does not delete an unknown alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/i_dont_exist`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(404);
    });

    it('does not delete a primary alias (if it is not the only one)', async () => {
      const note = await testSetup.notesService.getNoteByIdOrAlias(testAlias);
      await testSetup.aliasService.addAlias(note, newAlias);

      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(400);

      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${newAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);
    });

    it('deletes a primary alias (if it is the only one)', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${newAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);

      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);
    });
  });
});
