import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { createDefaultMockNoteConfig } from '../../src/config/mock/note.config.mock';
import { NoteConfig } from '../../src/config/note.config';
import { TestSetup, TestSetupBuilder } from '../test-setup';
import { setupAgent } from './utils/setup-agent';
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

describe('Groups', () => {
  let testSetup: TestSetup;
  const noteConfigMock: NoteConfig = createDefaultMockNoteConfig();

  const testGroupName = 'test_group_1';
  const testGroupDisplayName = 'Test Group 1';

  let agentUser1: request.SuperAgentTest;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create({
      noteConfigMock: noteConfigMock,
    })
      .withUsers()
      .withNotes()
      .build();

    await testSetup.init();

    const agents = await setupAgent(testSetup);
    agentUser1 = agents[2];

    // create a test group
    await testSetup.groupService.createGroup(testGroupName, testGroupDisplayName);
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe(`${PRIVATE_API_PREFIX}/groups/:groupName`, () => {
    test('details for an existing groups can be retrieved', async () => {
      const response = await agentUser1.get(`${PRIVATE_API_PREFIX}/groups/${testGroupName}`);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(testGroupName);
      expect(response.body.displayName).toBe(testGroupDisplayName);
      expect(response.body.isSpecial).toBe(false);
    });

    test('details for non-existing groups cannot be retrieved', async () => {
      const response = await agentUser1.get(`${PRIVATE_API_PREFIX}/groups/i_dont_exist`);
      expect(response.status).toBe(404);
    });
  });
});
