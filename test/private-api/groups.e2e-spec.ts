/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import { LoginDto } from '../../src/identity/local/login.dto';
import {
  password1,
  TestSetup,
  TestSetupBuilder,
  username1,
} from '../test-setup';

describe('Groups', () => {
  let testSetup: TestSetup;
  let testuser1Session: request.SuperAgentTest;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
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

  test('API requires authentication', async () => {
    const response = await request(testSetup.app.getHttpServer()).get(
      '/api/private/groups/testgroup1',
    );
    expect(response.status).toBe(401);
  });
});
