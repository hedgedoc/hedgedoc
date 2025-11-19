/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Users', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    await testSetup.app.init();
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  test('details for existing users can be retrieved', async () => {
    let response = await request
      .agent(testSetup.app.getHttpServer())
      .get('/api/private/users/profile/testuser1');
    expect(response.status).toBe(200);
    expect(response.body.username).toBe('testuser1');

    response = await request
      .agent(testSetup.app.getHttpServer())
      .get('/api/private/users/profile/testuser2');
    expect(response.status).toBe(200);
    expect(response.body.username).toBe('testuser2');
  });

  test('details for non-existing users cannot be retrieved', async () => {
    const response = await request
      .agent(testSetup.app.getHttpServer())
      .get('/api/private/users/profile/i_dont_exist');
    expect(response.status).toBe(404);
  });
});
