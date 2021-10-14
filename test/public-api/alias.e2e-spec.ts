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

describe('Notes', () => {
  let testSetup: TestSetup;

  let user: User;
  let content: string;
  let forbiddenNoteId: string;

  beforeAll(async () => {
    testSetup = await TestSetup.create();

    forbiddenNoteId =
      testSetup.configService.get('appConfig').forbiddenNoteIds[0];

    await testSetup.app.init();

    user = await testSetup.userService.createUser('hardcoded', 'Testy');
    content = 'This is a test note.';
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
        testAlias,
        user,
      );
      publicId = note.publicId;
    });

    it('create with normal alias', async () => {
      const newAlias = 'normalAlias';
      newAliasDto.newAlias = newAlias;
      const metadata = await request(testSetup.app.getHttpServer())
        .post(`/alias`)
        .set('Content-Type', 'application/json')
        .send(newAliasDto)
        .expect(201);
      expect(metadata.body.name).toEqual(newAlias);
      expect(metadata.body.primaryAlias).toBeFalsy();
      expect(metadata.body.noteId).toEqual(publicId);
      const note = await request(testSetup.app.getHttpServer())
        .get(`/notes/${newAlias}`)
        .expect(200);
      expect(note.body.metadata.aliases).toContain(newAlias);
      expect(note.body.metadata.primaryAlias).toBeTruthy();
      expect(note.body.metadata.id).toEqual(publicId);
    });

    describe('does not create an alias', () => {
      it('because of a forbidden alias', async () => {
        newAliasDto.newAlias = forbiddenNoteId;
        await request(testSetup.app.getHttpServer())
          .post(`/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(400);
      });
      it('because of a alias that is a public id', async () => {
        newAliasDto.newAlias = publicId;
        await request(testSetup.app.getHttpServer())
          .post(`/alias`)
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
        testAlias,
        user,
      );
      publicId = note.publicId;
      await testSetup.aliasService.addAlias(note, newAlias);
    });

    it('updates a note with a normal alias', async () => {
      const metadata = await request(testSetup.app.getHttpServer())
        .put(`/alias/${newAlias}`)
        .set('Content-Type', 'application/json')
        .send(changeAliasDto)
        .expect(200);
      expect(metadata.body.name).toEqual(newAlias);
      expect(metadata.body.primaryAlias).toBeTruthy();
      expect(metadata.body.noteId).toEqual(publicId);
      const note = await request(testSetup.app.getHttpServer())
        .get(`/notes/${newAlias}`)
        .expect(200);
      expect(note.body.metadata.aliases).toContain(newAlias);
      expect(note.body.metadata.primaryAlias).toBeTruthy();
      expect(note.body.metadata.id).toEqual(publicId);
    });

    describe('does not update', () => {
      it('a note with unknown alias', async () => {
        await request(testSetup.app.getHttpServer())
          .put(`/alias/i_dont_exist`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(404);
      });
      it('if the property primaryAlias is false', async () => {
        changeAliasDto.primaryAlias = false;
        await request(testSetup.app.getHttpServer())
          .put(`/alias/${newAlias}`)
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
        testAlias,
        user,
      );
      await testSetup.aliasService.addAlias(note, newAlias);
    });

    it('deletes a normal alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/alias/${newAlias}`)
        .expect(204);
      await request(testSetup.app.getHttpServer())
        .get(`/notes/${newAlias}`)
        .expect(404);
    });

    it('does not delete an unknown alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/alias/i_dont_exist`)
        .expect(404);
    });

    it('does not delete a primary alias (if it is not the only one)', async () => {
      const note = await testSetup.notesService.getNoteByIdOrAlias(testAlias);
      await testSetup.aliasService.addAlias(note, newAlias);
      await request(testSetup.app.getHttpServer())
        .delete(`/alias/${testAlias}`)
        .expect(400);
      await request(testSetup.app.getHttpServer())
        .get(`/notes/${newAlias}`)
        .expect(200);
    });

    it('deletes a primary alias (if it is the only one)', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/alias/${newAlias}`)
        .expect(204);
      await request(testSetup.app.getHttpServer())
        .delete(`/alias/${testAlias}`)
        .expect(204);
    });
  });
});
