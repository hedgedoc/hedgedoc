/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import { AuthConfig } from '../../src/config/auth.config';
import { User } from '../../src/users/user.entity';
import { setupSessionMiddleware } from '../../src/utils/session';
import { TestSetup } from '../test-setup';

describe('Tokens', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  let user: User;
  let keyId: string;

  beforeAll(async () => {
    testSetup = await TestSetup.create();

    user = await testSetup.userService.createUser('hardcoded', 'Testy');
    await testSetup.identityService.createLocalIdentity(user, 'test');

    const authConfig = testSetup.configService.get('authConfig') as AuthConfig;
    setupSessionMiddleware(testSetup.app, authConfig);

    await testSetup.app.init();

    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/auth/local/login')
      .send({ username: 'hardcoded', password: 'test' })
      .expect(201);
  });

  it(`POST /tokens`, async () => {
    const tokenName = 'testToken';
    const response = await agent
      .post('/tokens')
      .send({
        label: tokenName,
      })
      .expect('Content-Type', /json/)
      .expect(201);
    keyId = response.body.keyId;
    expect(response.body.label).toBe(tokenName);
    expect(response.body.validUntil).toBe(null);
    expect(response.body.lastUsed).toBe(null);
    expect(response.body.secret.length).toBe(84);
  });

  it(`GET /tokens`, async () => {
    const tokenName = 'testToken';
    const response = await agent
      .get('/tokens/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body[0].label).toBe(tokenName);
    expect(response.body[0].validUntil).toBe(null);
    expect(response.body[0].lastUsed).toBe(null);
    expect(response.body[0].secret).not.toBeDefined();
  });
  it(`DELETE /tokens/:keyid`, async () => {
    const response = await agent.delete('/tokens/' + keyId).expect(204);
    expect(response.body).toStrictEqual({});
  });
  it(`GET /tokens 2`, async () => {
    const response = await agent
      .get('/tokens/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toStrictEqual([]);
  });
});
