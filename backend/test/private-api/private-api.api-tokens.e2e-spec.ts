/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiTokenWithSecretInterface } from '@hedgedoc/commons';
import { DateTime } from 'luxon';
import request from 'supertest';

import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { TestSetup, TestSetupBuilder } from '../test-setup';
import { setupAgent } from './utils/setup-agent';

describe('Tokens', () => {
  let testSetup: TestSetup;

  let agentNotLoggedIn: request.SuperAgentTest;
  let agentGuestUser: request.SuperAgentTest;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    await testSetup.app.init();

    [agentNotLoggedIn, agentGuestUser, agentUser1, agentUser2] =
      await setupAgent(testSetup);
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe(`POST ${PRIVATE_API_PREFIX}/tokens`, () => {
    const tokenName = 'private-api-test-token';
    describe('user can create api tokens', () => {
      let apiTokenWithSecret: ApiTokenWithSecretInterface;
      afterEach(() => {
        expect(apiTokenWithSecret.label).toBe(tokenName);
        expect(
          new Date(apiTokenWithSecret.validUntil).getTime(),
        ).toBeGreaterThan(Date.now());
        expect(apiTokenWithSecret.lastUsedAt).toBe(null);
        expect(apiTokenWithSecret.secret.length).toBe(102);
      });
      it('with validUntil', async () => {
        const validUntilInTwoDays = DateTime.utc().plus({ days: 2 }).toISO();
        const response = await agentUser1
          .post(`${PRIVATE_API_PREFIX}/tokens`)
          .send({
            label: tokenName,
            validUntil: validUntilInTwoDays,
          })
          .expect('Content-Type', /json/)
          .expect(201);
        apiTokenWithSecret = response.body;
      });
      it('without validUntil', async () => {
        const response = await agentUser1
          .post(`${PRIVATE_API_PREFIX}/tokens`)
          .send({
            label: tokenName,
          })
          .expect('Content-Type', /json/)
          .expect(201);
        apiTokenWithSecret = response.body;
      });
    });
    it("guest users can't create api tokens", async () => {
      await agentGuestUser
        .post(`${PRIVATE_API_PREFIX}/tokens`)
        .send({
          label: tokenName,
          validUntil: 0,
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });
    it("non logged-in users can't create api tokens", async () => {
      await agentNotLoggedIn
        .post(`${PRIVATE_API_PREFIX}/tokens`)
        .send({
          label: tokenName,
          validUntil: 0,
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/tokens`, () => {
    const tokenName = 'test';
    beforeEach(async () => {
      await testSetup.apiTokenService.createToken(
        testSetup.userIds[0],
        tokenName,
      );
    });
    it('owner can see api tokens', async () => {
      const response = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/tokens/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body[0].label).toBe(tokenName);
      expect(new Date(response.body[0].validUntil).getTime()).toBeGreaterThan(
        Date.now(),
      );
      expect(response.body[0].lastUsedAt).toBe(null);
      expect(response.body[0].secret).not.toBeDefined();
    });
    it("other user can't see api tokens", async () => {
      const response = await agentUser2
        .get(`${PRIVATE_API_PREFIX}/tokens/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
    });
    it("guest user can't see api tokens", async () => {
      await agentGuestUser
        .get(`${PRIVATE_API_PREFIX}/tokens/`)
        .expect('Content-Type', /json/)
        .expect(401);
    });
    it("non logged-in user can't see api tokens", async () => {
      await agentNotLoggedIn
        .get(`${PRIVATE_API_PREFIX}/tokens/`)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });
  describe(`DELETE ${PRIVATE_API_PREFIX}/tokens/:keyid`, () => {
    const tokenName = 'private-api-test-token';
    let keyId: string;
    beforeEach(async () => {
      const token = await testSetup.apiTokenService.createToken(
        testSetup.userIds[0],
        tokenName,
      );
      keyId = token.keyId;
    });
    it('owner can delete api tokens', async () => {
      const tokensBefore = await testSetup.apiTokenService.getTokensOfUserById(
        testSetup.userIds[0],
      );
      expect(tokensBefore).toHaveLength(2);
      await agentUser1
        .delete(`${PRIVATE_API_PREFIX}/tokens/${keyId}`)
        .expect(204);
      const tokens = await testSetup.apiTokenService.getTokensOfUserById(
        testSetup.userIds[0],
      );
      // As we already have a token for each user, because of testSetup this is 1 instead of 0
      expect(tokens).toHaveLength(1);
    });
    it("other user can't delete api tokens", async () => {
      await agentUser2
        .delete(`${PRIVATE_API_PREFIX}/tokens/${keyId}`)
        .expect(404);
    });
    it("guest user can't delete api tokens", async () => {
      await agentGuestUser
        .delete(`${PRIVATE_API_PREFIX}/tokens/${keyId}`)
        .expect(401);
    });
    it("non logged-in user can't delete api tokens", async () => {
      await agentNotLoggedIn
        .delete(`${PRIVATE_API_PREFIX}/tokens/${keyId}`)
        .expect(401);
    });
  });
});
