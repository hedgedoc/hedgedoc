import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { noteAlias1, TestSetup, TestSetupBuilder } from '../test-setup';
import { setupAgent } from './utils/setup-agent';
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasCreateInterface, AliasUpdateInterface } from '@hedgedoc/commons';
import request from 'supertest';

describe('Alias', () => {
  let testSetup: TestSetup;

  let forbiddenAlias: string;

  let agentNotLoggedIn: request.SuperAgentTest;
  let agentGuestUser: request.SuperAgentTest;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;

  let noteId: number = NaN;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    await testSetup.app.init();

    [agentNotLoggedIn, agentGuestUser, agentUser1, agentUser2] = await setupAgent(testSetup);

    forbiddenAlias = testSetup.configService.get('noteConfig').forbiddenAliases[0];
    noteId = await testSetup.notesService.getNoteIdByAlias(noteAlias1);
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe(`POST ${PRIVATE_API_PREFIX}/alias`, () => {
    const newAliasDto: AliasCreateInterface = {
      noteAlias: noteAlias1,
      newAlias: '',
    };

    it('creates a normal alias', async () => {
      const newAlias = 'new-alias';
      newAliasDto.newAlias = newAlias;

      await agentUser1
        .post(`${PRIVATE_API_PREFIX}/alias`)
        .set('Content-Type', 'application/json')
        .send(newAliasDto)
        .expect(201);
      const metadata = await testSetup.notesService.toNoteMetadataDto(noteId);
      expect(metadata.aliases).toContain(noteAlias1);
      expect(metadata.aliases).toContain(newAlias);
      expect(metadata.primaryAlias).toEqual(noteAlias1);
    });

    describe('does not create an alias', () => {
      it('because of a forbidden alias', async () => {
        newAliasDto.newAlias = forbiddenAlias;

        await agentUser1
          .post(`${PRIVATE_API_PREFIX}/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(403);
      });
      it('because of an already existing alias', async () => {
        const existingAlias = 'existingAlias';
        await testSetup.aliasService.addAlias(noteId, existingAlias);
        newAliasDto.newAlias = existingAlias;

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
      it('because the user is a guest user', async () => {
        newAliasDto.newAlias = 'normal-alias';

        await agentGuestUser
          .post(`${PRIVATE_API_PREFIX}/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(401);
      });
      it('because the user is not logged in', async () => {
        newAliasDto.newAlias = 'normal-alias';

        await agentNotLoggedIn
          .post(`${PRIVATE_API_PREFIX}/alias`)
          .set('Content-Type', 'application/json')
          .send(newAliasDto)
          .expect(401);
      });
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/alias/:alias`, () => {
    const changeAliasDto: AliasUpdateInterface = {
      primaryAlias: true,
    };

    it('correctly set primary alias', async () => {
      const newAlias = 'new-alias';
      await testSetup.aliasService.addAlias(noteId, newAlias);
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/alias/${newAlias}`)
        .set('Content-Type', 'application/json')
        .send(changeAliasDto)
        .expect(200);
      const metadata = await testSetup.notesService.toNoteMetadataDto(noteId);
      expect(metadata.aliases).toContainEqual(newAlias);
      expect(metadata.aliases).toContainEqual(noteAlias1);
      expect(metadata.primaryAlias).toEqual(newAlias);
    });

    describe('does not set primary alias', () => {
      it('for a note with unknown alias', async () => {
        await agentUser1
          .put(`${PRIVATE_API_PREFIX}/alias/i_dont_exist`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(404);
      });
      it('for a note with a forbidden ID', async () => {
        await agentUser1
          .put(`${PRIVATE_API_PREFIX}/alias/${forbiddenAlias}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(403);
      });
      it('if the property primaryAlias is false', async () => {
        await agentUser1
          .put(`${PRIVATE_API_PREFIX}/alias/${noteAlias1}`)
          .set('Content-Type', 'application/json')
          .send({
            primaryAlias: false,
          })
          .expect(400);
      });
      it('if the user is not an owner', async () => {
        changeAliasDto.primaryAlias = true;
        await agentUser2
          .put(`${PRIVATE_API_PREFIX}/alias/${noteAlias1}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(401);
      });
      it('if the user is not logged in', async () => {
        changeAliasDto.primaryAlias = true;
        await agentNotLoggedIn
          .put(`${PRIVATE_API_PREFIX}/alias/${noteAlias1}`)
          .set('Content-Type', 'application/json')
          .send(changeAliasDto)
          .expect(401);
      });
    });
  });

  describe(`DELETE ${PRIVATE_API_PREFIX}/alias/:alias`, () => {
    const newAlias = 'new-alias';
    beforeEach(async () => {
      await testSetup.aliasService.addAlias(noteId, newAlias);
    });

    it('correctly deletes the alias', async () => {
      await expect(testSetup.notesService.getNoteIdByAlias(newAlias)).resolves.toBe(noteId);
      await agentUser1.delete(`${PRIVATE_API_PREFIX}/alias/${newAlias}`).expect(204);
      await expect(testSetup.notesService.getNoteIdByAlias(newAlias)).rejects.toThrow();
    });

    describe('does not delete the alias', () => {
      it("if it's an unknown alias", async () => {
        await agentUser1.delete(`${PRIVATE_API_PREFIX}/alias/i_dont_exist`).expect(404);
      });

      it('if the alias is forbidden', async () => {
        await agentUser1.delete(`${PRIVATE_API_PREFIX}/alias/${forbiddenAlias}`).expect(403);
      });

      it('if the user does not own the note', async () => {
        await agentUser2.delete(`${PRIVATE_API_PREFIX}/alias/${newAlias}`).expect(401);
      });

      it("if it's primary", async () => {
        await agentUser1.delete(`${PRIVATE_API_PREFIX}/alias/${noteAlias1}`).expect(400);
      });

      it('if the user is not logged in', async () => {
        await agentNotLoggedIn.delete(`${PRIVATE_API_PREFIX}/alias/${newAlias}`).expect(401);
      });
    });
  });
});
