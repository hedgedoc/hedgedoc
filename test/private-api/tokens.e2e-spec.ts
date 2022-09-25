/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import { User } from '../../src/users/user.entity';
import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Tokens', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  let user: User;
  let keyId: string;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().build();
    const username = 'hardcoded';
    const password = 'AHardcodedStrongP@ssword123';

    user = await testSetup.userService.createUser(username, 'Testy');
    await testSetup.identityService.createLocalIdentity(user, password);
    await testSetup.app.init();

    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/private/auth/local/login')
      .send({ username: username, password: password })
      .expect(201);
  });

  afterAll(async () => {
    await testSetup.cleanup();
  });

  it(`POST /tokens`, async () => {
    const tokenName = 'testToken';
    const response = await agent
      .post('/api/private/tokens')
      .send({
        label: tokenName,
        validUntil: 0,
      })
      .expect('Content-Type', /json/)
      .expect(201);
    keyId = response.body.keyId;
    expect(response.body.label).toBe(tokenName);
    expect(new Date(response.body.validUntil).getTime()).toBeGreaterThan(
      Date.now(),
    );
    expect(response.body.lastUsedAt).toBe(null);
    expect(response.body.secret.length).toBe(98);
  });

  it(`GET /tokens`, async () => {
    const tokenName = 'testToken';
    const response = await agent
      .get('/api/private/tokens/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body[0].label).toBe(tokenName);
    expect(new Date(response.body[0].validUntil).getTime()).toBeGreaterThan(
      Date.now(),
    );
    expect(response.body[0].lastUsedAt).toBe(null);
    expect(response.body[0].secret).not.toBeDefined();
  });
  it(`DELETE /tokens/:keyid`, async () => {
    const response = await agent
      .delete('/api/private/tokens/' + keyId)
      .expect(204);
    expect(response.body).toStrictEqual({});
  });
  it(`GET /tokens 2`, async () => {
    const response = await agent
      .get('/api/private/tokens/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toStrictEqual([]);
  });
});
