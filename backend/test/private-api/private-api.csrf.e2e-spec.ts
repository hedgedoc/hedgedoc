/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { password1, TestSetup, TestSetupBuilder, username1 } from '../test-setup';
import { setupAgent } from './utils/setup-agent';
import request from 'supertest';

describe('CSRF Protection', () => {
  let testSetup: TestSetup;

  let agentUser1: request.SuperAgentTest;
  let agentUser1WithoutCsrf: request.SuperAgentTest;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    await testSetup.init();

    [, , agentUser1] = await setupAgent(testSetup);

    // Create a separate agent without CSRF token for testing rejection
    agentUser1WithoutCsrf = request.agent(testSetup.app.getHttpServer());
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe(`GET ${PRIVATE_API_PREFIX}/csrf/token`, () => {
    it('returns a CSRF token', async () => {
      const response = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/csrf/token`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });
  });

  describe('CSRF token validation', () => {
    it('allows state-changing requests with valid CSRF token', async () => {
      await agentUser1
        .post(`${PRIVATE_API_PREFIX}/notes`)
        .set('Content-Type', 'text/markdown')
        .send('Test note content')
        .expect(201);
    });

    it('rejects state-changing requests without CSRF token', async () => {
      await agentUser1WithoutCsrf
        .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
        .send({ username: username1, password: password1 })
        .expect(403);
    });

    it('rejects state-changing requests with invalid CSRF token', async () => {
      await agentUser1WithoutCsrf
        .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
        .set('csrf-token', 'invalid-token')
        .send({ username: username1, password: password1 })
        .expect(403);
    });

    it('allows GET requests without CSRF token', async () => {
      await agentUser1.get(`${PRIVATE_API_PREFIX}/me`).expect(200);
    });
  });
});
