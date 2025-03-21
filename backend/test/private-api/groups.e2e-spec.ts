/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GuestAccess, LoginDto } from '@hedgedoc/commons';
import request from 'supertest';

import { createDefaultMockNoteConfig } from '../../src/config/mock/note.config.mock';
import { NoteConfig } from '../../src/config/note.config';
import {
  password1,
  TestSetup,
  TestSetupBuilder,
  username1,
} from '../test-setup';

describe('Groups', () => {
  let testSetup: TestSetup;
  let testuser1Session: request.SuperAgentTest;
  const noteConfigMock: NoteConfig = createDefaultMockNoteConfig();

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create({
      noteConfigMock: noteConfigMock,
    })
      .withUsers()
      .build();
    await testSetup.app.init();

    // create a test group
    await testSetup.groupService.createGroup('testgroup1', 'testgroup1', false);

    // log in to create a session
    const loginDto: LoginDto = {
      password: password1,
      username: username1,
    };
    testuser1Session = request.agent(testSetup.app.getHttpServer());
    await testuser1Session
      .post('/api/private/auth/local/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(loginDto))
      .expect(201);
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  test('details for existing groups can be retrieved', async () => {
    const response = await testuser1Session.get(
      '/api/private/groups/testgroup1',
    );
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('testgroup1');
  });

  test('details for non-existing groups cannot be retrieved', async () => {
    const response = await testuser1Session.get(
      '/api/private/groups/i_dont_exist',
    );
    expect(response.status).toBe(404);
  });

  describe('API requires authentication', () => {
    beforeAll(() => {
      noteConfigMock.guestAccess = GuestAccess.DENY;
    });
    test('get group', async () => {
      const response = await request(testSetup.app.getHttpServer()).get(
        '/api/private/groups/testgroup1',
      );
      expect(response.status).toBe(401);
    });
  });
});
