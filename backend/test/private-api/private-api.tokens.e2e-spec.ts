/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import {
  password1,
  password2,
  TestSetup,
  TestSetupBuilder,
  username1,
  username2,
} from '../test-setup';

describe('Tokens', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  let keyId: string;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    await testSetup.app.init();

    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/private/auth/local/login')
      .send({ username: username1, password: password1 })
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
    expect(response.body.secret.length).toBe(102);
  });

  it(`GET /tokens`, async () => {
    const tokenName = 'test';
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
    // try to delete token with wrong user
    const agent2 = request.agent(testSetup.app.getHttpServer());
    await agent2
      .post('/api/private/auth/local/login')
      .send({ username: username2, password: password2 })
      .expect(201);
    let response = await agent2
      .delete('/api/private/tokens/' + keyId)
      .expect(401);
    expect(response.body.statusCode).toEqual(401);

    // delete token with correct user
    response = await agent.delete('/api/private/tokens/' + keyId).expect(204);
    expect(response.body).toStrictEqual({});

    // token should be deleted
    response = await agent
      .get('/api/private/tokens/')
      .expect('Content-Type', /json/)
      .expect(200);
    const tokenList: { keyId: string }[] = response.body;
    expect(
      tokenList.find((token) => {
        return token.keyId === keyId;
      }),
    ).toBeUndefined();
  });
});
