/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasCreateDto, AliasUpdateDto } from '@hedgedoc/commons';
import request from 'supertest';

import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Alias', () => {
  let testSetup: TestSetup;

  let forbiddenAlias: string;
  let testAlias: string;
  let noteId: number;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    forbiddenAlias =
      testSetup.configService.get('noteConfig').forbiddenNoteIds[0];
    await testSetup.app.init();
    noteId = testSetup.ownedNoteIds[0];
    testAlias = await testSetup.aliasService.getPrimaryAliasByNoteId(noteId);
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe('POST /alias', () => {
    it('create with normal alias', async () => {
      const normalNewAlias = 'normal-new-alias';
      const newAliasDto: AliasCreateDto = {
        noteAlias: testAlias,
        newAlias: normalNewAlias,
      };
      const metadata = await request(testSetup.app.getHttpServer())
        .post(`/api/v2/alias`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'application/json')
        .send(newAliasDto)
        .expect(201);

      expect(metadata.body.name).toEqual(normalNewAlias);
      expect(metadata.body.isPrimaryAlias).toBe(false);

      const note = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/normalAlias`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);

      expect(note.body.metadata.aliases).toContainEqual(normalNewAlias);
      expect(note.body.metadata.primaryAlias).toEqual(testAlias);
    });

    describe('does not create an alias', () => {
      it('because it is already used', async () => {
        const newAliasDto: AliasCreateDto = {
          noteAlias: testAlias,
          newAlias: testAlias,
        };
        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(409);
      });

      it('because of a forbidden alias', async () => {
        const newAliasDto: AliasCreateDto = {
          noteAlias: testAlias,
          newAlias: forbiddenAlias,
        };
        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(400);
      });
      it('because of a alias that is a public id', async () => {
        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send({
            noteIdOrAlias: testAlias,
            newAlias: noteId,
          })
          .expect(409);
      });
      it('because the user is not an owner', async () => {
        const newAliasDto: AliasCreateDto = {
          noteAlias: testAlias,
          newAlias: 'some-new-alias',
        };
        await request(testSetup.app.getHttpServer())
          .post(`/api/v2/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(401);
      });
    });
  });

  describe('PUT /alias/{alias}', () => {
    const changeAliasDto: AliasUpdateDto = {
      primaryAlias: true,
    };

    it('updates a note with a normal alias', async () => {
      const secondAlias = 'secondAlias';
      await testSetup.aliasService.addAlias(noteId, secondAlias);
      const metadata = await request(testSetup.app.getHttpServer())
        .put(`/api/v2/alias/${secondAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'application/json')
        .send(changeAliasDto)
        .expect(200);

      expect(metadata.body.name).toEqual(secondAlias);
      expect(metadata.body.isPrimaryAlias).toBe(true);

      const note = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${testAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);

      expect(note.body.metadata.aliases).toContainEqual(testAlias);
      expect(note.body.metadata.aliases).toContainEqual(secondAlias);
      expect(note.body.metadata.primaryAlias).toEqual(secondAlias);
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
      it('a note with a forbidden alias', async () => {
        await request(testSetup.app.getHttpServer())
          .put(`/api/v2/alias/${forbiddenAlias}`)
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
        // The typecast is required since we want to test an invalid input
        const changeAliasDtoNonPrimary = {
          primaryAlias: false,
        } as unknown as AliasUpdateDto;
        await request(testSetup.app.getHttpServer())
          .put(`/api/v2/alias/${testAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDtoNonPrimary)
          .expect(400);
      });
    });
  });

  describe('DELETE /alias/{alias}', () => {
    const secondAlias = 'second-alias';

    it('deletes a normal alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/alias/${secondAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);

      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${secondAlias}`)
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
        .delete(`/api/v2/alias/${forbiddenAlias}`)
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
        testSetup.ownedNoteIds[0],
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
        testSetup.ownedNoteIds[0],
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
