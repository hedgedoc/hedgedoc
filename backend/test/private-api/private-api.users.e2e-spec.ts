/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';
import { PRIVATE_API_PREFIX } from '../../src/app.module';
import {
  displayName1,
  displayName2,
  TestSetup,
  TestSetupBuilder,
  username1,
  username2,
} from '../test-setup';
import { extendAgentWithCsrf } from './utils/setup-agent';

describe('Users', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    await testSetup.init();
    const originalAgent = request.agent(testSetup.app.getHttpServer());
    agent = await extendAgentWithCsrf(originalAgent);
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe(`POST ${PRIVATE_API_PREFIX}/users/check`, () => {
    it('return false for already used username', async () => {
      const responseUser1 = await agent
        .post(`${PRIVATE_API_PREFIX}/users/check`)
        .send({
          username: username1,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseUser1.body.usernameAvailable).toBe(false);

      const responseUser2 = await agent
        .post(`${PRIVATE_API_PREFIX}/users/check`)
        .send({
          username: username2,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseUser2.body.usernameAvailable).toBe(false);
    });
    it('return true for unused usernames', async () => {
      const response = await agent
        .post(`${PRIVATE_API_PREFIX}/users/check`)
        .send({
          username: 'MissingUser',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.usernameAvailable).toBe(true);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/profile/:username`, () => {
    it('details for existing users can be retrieved', async () => {
      const responseUser1 = await agent
        .get(`${PRIVATE_API_PREFIX}/users/profile/${username1}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseUser1.body.username).toBe(username1);
      expect(responseUser1.body.displayName).toBe(displayName1);

      const responseUser2 = await agent
        .get(`${PRIVATE_API_PREFIX}/users/profile/${username2}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseUser2.body.username).toBe(username2);
      expect(responseUser2.body.displayName).toBe(displayName2);
    });

    it('details for non-existing users cannot be retrieved', async () => {
      await agent.get(`${PRIVATE_API_PREFIX}/users/profile/i_dont_exist`).expect(404);
    });
  });
});
