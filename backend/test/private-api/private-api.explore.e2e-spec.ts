/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SortMode } from '@hedgedoc/commons';
import { NoteType } from '@hedgedoc/database';
import { PRIVATE_API_PREFIX } from '../../src/app.module';
import {
  noteAlias1,
  noteAlias2,
  noteAlias3,
  password3,
  TestSetup,
  TestSetupBuilder,
  username3,
} from '../test-setup';
import { extendAgentWithCsrf, setupAgent } from './utils/setup-agent';
import request from 'supertest';

describe('Explore', () => {
  let testSetup: TestSetup;

  let forbiddenAlias: string;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;
  let agentUser3: request.SuperAgentTest;

  const sortModes: SortMode[] = Object.values(SortMode);

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    await testSetup.init();

    [, , agentUser1, agentUser2] = await setupAgent(testSetup);
    const originalAgentUser3 = request.agent(testSetup.app.getHttpServer());
    agentUser3 = await extendAgentWithCsrf(originalAgentUser3);
    await agentUser3
      .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
      .send({ username: username3, password: password3 })
      .expect(201);

    forbiddenAlias = testSetup.configService.get('noteConfig').forbiddenAliases[0];
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe(`GET ${PRIVATE_API_PREFIX}/explore/my`, () => {
    describe('return only own notes for user', () => {
      describe.each(sortModes.map((sortMode) => [sortMode]))('with sorting note', (sortMode) => {
        it(`${sortMode}`, async () => {
          const response = await agentUser2
            .get(`${PRIVATE_API_PREFIX}/explore/my?sort=${sortMode}`)
            .expect('Content-Type', /json/)
            .expect(200);
          const myNotes = response.body;
          expect(myNotes.length).toBe(1);
          expect(myNotes[0].primaryAlias).toEqual(noteAlias2);
        });
      });
      it('with search term', async () => {
        const response = await agentUser2
          .get(`${PRIVATE_API_PREFIX}/explore/my?search=2`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(1);
        expect(myNotes[0].primaryAlias).toEqual(noteAlias2);
      });
      it(`with type ${NoteType.SLIDE}`, async () => {
        const response = await agentUser3
          .get(`${PRIVATE_API_PREFIX}/explore/my?type=${NoteType.SLIDE}`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(1);
        expect(myNotes[0].primaryAlias).toEqual(noteAlias3);
      });
    });
    describe('does not find own notes for user', () => {
      it('on page 2', async () => {
        const response = await agentUser2
          .get(`${PRIVATE_API_PREFIX}/explore/my?page=2`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
      it('with search term that does not exist', async () => {
        const response = await agentUser2
          .get(`${PRIVATE_API_PREFIX}/explore/my?search=1`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
      it(`with type ${NoteType.SLIDE}`, async () => {
        const response = await agentUser2
          .get(`${PRIVATE_API_PREFIX}/explore/my?type=${NoteType.SLIDE}`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
    });
    it('throws error if page parameter is below 1', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/my?page=0`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
    it('throws error if sort parameter is unknown', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/my?sort=stuff`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
    it('throws error if type parameter is unknown', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/my?type=spreadsheet`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/explore/shared`, () => {
    describe('return shared notes for user', () => {
      describe.each(sortModes.map((sortMode) => [sortMode]))('with sorting note', (sortMode) => {
        beforeEach(async () => {
          // Allow user1 to read the document from user 2
          await testSetup.permissionsService.setUserPermission(
            testSetup.ownedNoteIds[1],
            testSetup.userIds[0],
            false,
          );
        });
        it(`${sortMode}`, async () => {
          const response = await agentUser1
            .get(`${PRIVATE_API_PREFIX}/explore/shared?sort=${sortMode}`)
            .expect('Content-Type', /json/)
            .expect(200);
          const myNotes = response.body;
          expect(myNotes.length).toBe(1);
          expect(myNotes[0].primaryAlias).toEqual(noteAlias2);
        });
      });
      it('with search term', async () => {
        // Allow user1 to read the document from user 2
        await testSetup.permissionsService.setUserPermission(
          testSetup.ownedNoteIds[1],
          testSetup.userIds[0],
          false,
        );
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/shared?search=2`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(1);
        expect(myNotes[0].primaryAlias).toEqual(noteAlias2);
      });
      it(`with type ${NoteType.SLIDE}`, async () => {
        // Allow user1 to read the slide from user 3
        await testSetup.permissionsService.setUserPermission(
          testSetup.ownedNoteIds[2],
          testSetup.userIds[0],
          false,
        );
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/shared?type=${NoteType.SLIDE}`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(1);
        expect(myNotes[0].primaryAlias).toEqual(noteAlias3);
      });
    });
    describe('does not find shared notes for user', () => {
      it('on page 2', async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/shared?page=2`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
      it('with search term that does not exist', async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/shared?search=1`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
      it(`with type ${NoteType.SLIDE}`, async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/shared?type=${NoteType.SLIDE}`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
    });
    it('throws error if page parameter is below 1', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/shared?page=0`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
    it('throws error if sort parameter is unknown', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/shared?sort=stuff`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
    it('throws error if type parameter is unknown', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/shared?type=spreadsheet`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/explore/public`, () => {
    describe('return public notes', () => {
      describe.each(sortModes.map((sortMode) => [sortMode]))('with sorting note', (sortMode) => {
        it(`${sortMode}`, async () => {
          const response = await agentUser1
            .get(`${PRIVATE_API_PREFIX}/explore/public?sort=${sortMode}`)
            .expect('Content-Type', /json/)
            .expect(200);
          const myNotes = response.body;
          expect(myNotes.length).toBe(2);
        });
      });
      it('with search term', async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/public?search=2`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(1);
        expect(myNotes[0].primaryAlias).toEqual(noteAlias2);
      });
      it(`with type ${NoteType.SLIDE}`, async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/public?type=${NoteType.SLIDE}`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(1);
        expect(myNotes[0].primaryAlias).toEqual(noteAlias3);
      });
    });
    describe('does not find public notes', () => {
      it('on page 2', async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/public?page=2`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
      it('with search term that does not exist', async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/public?search=1`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
    });
    it('throws error if page parameter is below 1', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/public?page=0`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
    it('throws error if sort parameter is unknown', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/public?sort=stuff`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
    it('throws error if type parameter is unknown', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/public?type=spreadsheet`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/explore/pinned`, () => {
    it('return shared notes for user', async () => {
      // Pin note2 with user1
      await testSetup.exploreService.setNotePinStatus(
        testSetup.userIds[0],
        testSetup.ownedNoteIds[1],
        true,
      );
      const response = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/explore/pinned`)
        .expect('Content-Type', /json/)
        .expect(200);
      const myNotes = response.body;
      expect(myNotes.length).toBe(1);
      expect(myNotes[0].primaryAlias).toEqual(noteAlias2);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/explore/visited`, () => {
    describe('return visited notes for user', () => {
      describe.each(sortModes.map((sortMode) => [sortMode]))('with sorting note', (sortMode) => {
        beforeEach(async () => {
          // User1 visited Note2
          await testSetup.notesService.markNoteAsVisited(
            testSetup.ownedNoteIds[1],
            testSetup.userIds[0],
          );
        });
        it(`${sortMode}`, async () => {
          const response = await agentUser1
            .get(`${PRIVATE_API_PREFIX}/explore/visited?sort=${sortMode}`)
            .expect('Content-Type', /json/)
            .expect(200);
          const myNotes = response.body;
          expect(myNotes.length).toBe(1);
          expect(myNotes[0].primaryAlias).toEqual(noteAlias2);
        });
      });
      it('with search term', async () => {
        // User1 visited Note2
        await testSetup.notesService.markNoteAsVisited(
          testSetup.ownedNoteIds[1],
          testSetup.userIds[0],
        );
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/visited?search=2`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(1);
        expect(myNotes[0].primaryAlias).toEqual(noteAlias2);
      });
      it(`with type ${NoteType.SLIDE}`, async () => {
        // User1 visited Note3
        await testSetup.notesService.markNoteAsVisited(
          testSetup.ownedNoteIds[2],
          testSetup.userIds[0],
        );
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/visited?type=${NoteType.SLIDE}`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(1);
        expect(myNotes[0].primaryAlias).toEqual(noteAlias3);
      });
    });
    describe('does not find visited notes for user', () => {
      it('on page 2', async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/visited?page=2`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
      it('with search term that does not exist', async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/visited?search=1`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
      it(`with type ${NoteType.SLIDE}`, async () => {
        const response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/explore/visited?type=${NoteType.SLIDE}`)
          .expect('Content-Type', /json/)
          .expect(200);
        const myNotes = response.body;
        expect(myNotes.length).toBe(0);
      });
    });
    it('throws error if page parameter is below 1', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/visited?page=0`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
    it('throws error if sort parameter is unknown', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/visited?sort=stuff`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
    it('throws error if type parameter is unknown', async () => {
      await agentUser2
        .get(`${PRIVATE_API_PREFIX}/explore/visited?type=spreadsheet`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/explore/pin/:noteAlias`, () => {
    it('pin a note', async () => {
      const pinnedNotesBefore = await testSetup.exploreService.getMyPinnedNoteExploreEntries(
        testSetup.userIds[0],
      );
      expect(pinnedNotesBefore.length).toBe(0);

      const response = await agentUser1
        .put(`${PRIVATE_API_PREFIX}/explore/pin/${noteAlias1}`)
        .set('Content-Type', 'application/json')
        .send({
          isPinned: true,
        })
        .expect(200);
      const note = response.body;
      expect(note.primaryAlias).toEqual(noteAlias1);

      const pinnedNotesAfter = await testSetup.exploreService.getMyPinnedNoteExploreEntries(
        testSetup.userIds[0],
      );
      expect(pinnedNotesAfter.length).toBe(1);
      expect(pinnedNotesAfter[0].primaryAlias).toEqual(noteAlias1);
    });
    it('throws error if note is forbidden', async () => {
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/explore/pin/${forbiddenAlias}`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});
