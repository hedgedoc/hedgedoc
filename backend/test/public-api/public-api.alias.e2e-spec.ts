/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import { PUBLIC_API_PREFIX } from '../../src/app.module';
import { AliasCreateDto } from '../../src/dtos/alias-create.dto';
import { AliasUpdateDto } from '../../src/dtos/alias-update.dto';
import { NotInDBError } from '../../src/errors/errors';
import { noteAlias1, TestSetup, TestSetupBuilder } from '../test-setup';

describe('Alias', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  let forbiddenAlias: string;
  let noteId: number;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    agent = request.agent(testSetup.app.getHttpServer());
    forbiddenAlias =
      testSetup.configService.get('noteConfig').forbiddenNoteIds[0];
    await testSetup.app.init();
    noteId = testSetup.ownedNoteIds[0];
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe(`POST ${PUBLIC_API_PREFIX}/alias`, () => {
    it('create normal alias', async () => {
      const normalNewAlias = 'normal-new-alias';
      const newAliasDto: AliasCreateDto = {
        noteAlias: noteAlias1,
        newAlias: normalNewAlias,
      };

      const metadata = await agent
        .post(`${PUBLIC_API_PREFIX}/alias`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'application/json')
        .send(newAliasDto)
        .expect(201);

      expect(metadata.body.name).toEqual(normalNewAlias);
      expect(metadata.body.isPrimaryAlias).toBe(false);

      const noteId =
        await testSetup.notesService.getNoteIdByAlias(normalNewAlias);
      const noteMetadata =
        await testSetup.notesService.toNoteMetadataDto(noteId);

      expect(noteMetadata.aliases).toContainEqual(normalNewAlias);
      expect(noteMetadata.primaryAlias).toEqual(noteAlias1);
    });

    describe('does not create an alias', () => {
      it('because it is already used', async () => {
        const newAliasDto: AliasCreateDto = {
          noteAlias: noteAlias1,
          newAlias: noteAlias1,
        };
        await agent
          .post(`${PUBLIC_API_PREFIX}/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(409);
      });

      it('because of a forbidden alias', async () => {
        const newAliasDto: AliasCreateDto = {
          noteAlias: noteAlias1,
          newAlias: forbiddenAlias,
        };
        await agent
          .post(`${PUBLIC_API_PREFIX}/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(403);
      });
      it('because the user is not an owner', async () => {
        const newAliasDto: AliasCreateDto = {
          noteAlias: noteAlias1,
          newAlias: 'some-new-alias',
        };
        await agent
          .post(`${PUBLIC_API_PREFIX}/alias`)
          .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(401);
      });
      it('if no token is provided', async () => {
        await agent
          .post(`${PUBLIC_API_PREFIX}/alias`)
          .set('Content-Type', 'application/json')
          .send({
            noteAlias: noteAlias1,
            newAlias: 'normal-new-alias',
          })
          .expect(403);
      });
    });
  });

  describe(`PUT ${PUBLIC_API_PREFIX}/alias/{:alias}`, () => {
    const changeAliasDto: AliasUpdateDto = {
      primaryAlias: true,
    };

    it('updates a note with a normal alias', async () => {
      const secondAlias = 'secondAlias';
      await testSetup.aliasService.addAlias(noteId, secondAlias);
      const metadata = await agent
        .put(`${PUBLIC_API_PREFIX}/alias/${secondAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'application/json')
        .send(changeAliasDto)
        .expect(200);

      expect(metadata.body.name).toEqual(secondAlias);
      expect(metadata.body.isPrimaryAlias).toBe(true);

      const note = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);

      expect(note.body.metadata.aliases).toContainEqual(noteAlias1);
      expect(note.body.metadata.aliases).toContainEqual(secondAlias);
      expect(note.body.metadata.primaryAlias).toEqual(secondAlias);
    });

    describe('does not update', () => {
      it('a note with unknown alias', async () => {
        await agent
          .put(`${PUBLIC_API_PREFIX}/alias/i_dont_exist`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(404);
      });
      it('a note with a forbidden alias', async () => {
        await agent
          .put(`${PUBLIC_API_PREFIX}/alias/${forbiddenAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(403);
      });
      it('if the user is not an owner', async () => {
        await agent
          .put(`${PUBLIC_API_PREFIX}/alias/${noteAlias1}`)
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
        await agent
          .put(`${PUBLIC_API_PREFIX}/alias/${noteAlias1}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDtoNonPrimary)
          .expect(400);
      });
      it('if no token is provided', async () => {
        const secondAlias = 'secondAlias';
        await testSetup.aliasService.addAlias(noteId, secondAlias);
        await agent
          .put(`${PUBLIC_API_PREFIX}/alias/${secondAlias}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(403);
      });
    });
  });

  describe(`DELETE ${PUBLIC_API_PREFIX}/alias/{:alias}`, () => {
    const secondAlias = 'second-alias';

    it('deletes a normal alias', async () => {
      await testSetup.aliasService.addAlias(
        testSetup.ownedNoteIds[0],
        secondAlias,
      );

      const noteIdBefore =
        await testSetup.notesService.getNoteIdByAlias(secondAlias);
      expect(noteIdBefore).toBeDefined();

      await agent
        .delete(`${PUBLIC_API_PREFIX}/alias/${secondAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);

      await expect(
        testSetup.notesService.getNoteIdByAlias(secondAlias),
      ).rejects.toThrow(NotInDBError);
    });

    describe('does not delete', () => {
      it('an unknown alias', async () => {
        await agent
          .delete(`${PUBLIC_API_PREFIX}/alias/i_dont_exist`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .expect(404);
      });

      it('an forbidden alias', async () => {
        await agent
          .delete(`${PUBLIC_API_PREFIX}/alias/${forbiddenAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .expect(403);
      });

      it('if user is not the owner', async () => {
        await agent
          .delete(`${PUBLIC_API_PREFIX}/alias/${noteAlias1}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
          .expect(401);
      });

      it('if alias is primary', async () => {
        // add another alias
        await testSetup.aliasService.addAlias(
          testSetup.ownedNoteIds[0],
          secondAlias,
        );

        // try to delete the primary alias
        await agent
          .delete(`${PUBLIC_API_PREFIX}/alias/${noteAlias1}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .expect(400);
        const noteId =
          await testSetup.notesService.getNoteIdByAlias(secondAlias);
        expect(noteId).toBeDefined();
      });
      it('if no token is provided', async () => {
        await agent
          .delete(`${PUBLIC_API_PREFIX}/alias/${secondAlias}`)
          .expect(403);
      });
    });
  });
});
