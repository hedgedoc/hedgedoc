/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import { LoginDto } from '../../src/identity/local/login.dto';
import { RegisterDto } from '../../src/identity/local/register.dto';
import { TestSetup } from '../test-setup';

describe('Register and Login', () => {
  let testSetup: TestSetup;

  const USERNAME = 'testuser';
  const DISPLAYNAME = 'A Test User';
  const PASSWORD = 'secure';

  beforeEach(async () => {
    testSetup = await TestSetup.create();
    await testSetup.app.init();
  });

  afterEach(async () => {
    await testSetup.app.close();
  });

  test('a user can successfully create a local account and log in', async () => {
    // register a new user
    const registrationDto: RegisterDto = {
      displayname: DISPLAYNAME,
      password: PASSWORD,
      username: USERNAME,
    };
    await request(testSetup.app.getHttpServer())
      .post('/api/private/auth/local')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(registrationDto))
      .expect(201);

    // log in with the new user and create a session
    const loginDto: LoginDto = {
      password: PASSWORD,
      username: USERNAME,
    };
    const session = request.agent(testSetup.app.getHttpServer());
    await session
      .post('/api/private/auth/local/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(loginDto))
      .expect(201);

    // request user profile
    const profile = await session.get('/api/private/me').expect(200);
    expect(profile.body.username).toEqual(USERNAME);
    expect(profile.body.displayName).toEqual(DISPLAYNAME);

    // logout again
    await session.delete('/api/private/auth/logout').expect(200);

    // not allowed to request profile now
    await session.get('/api/private/me').expect(401);
  });

  test('a username cannot be used twice', async () => {
    // register a new user
    const registrationDto: RegisterDto = {
      displayname: DISPLAYNAME,
      password: PASSWORD,
      username: USERNAME,
    };
    await request(testSetup.app.getHttpServer())
      .post('/api/private/auth/local')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(registrationDto))
      .expect(201);

    // try to use the same username again
    await request(testSetup.app.getHttpServer())
      .post('/api/private/auth/local')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(registrationDto))
      .expect(409);
  });

  test('a user can create a local account and change the password', async () => {
    // register a new user
    const registrationDto: RegisterDto = {
      displayname: DISPLAYNAME,
      password: PASSWORD,
      username: USERNAME,
    };
    await request(testSetup.app.getHttpServer())
      .post('/api/private/auth/local')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(registrationDto))
      .expect(201);

    // log in with the new user and create a session
    const loginDto: LoginDto = {
      password: PASSWORD,
      username: USERNAME,
    };
    let session = request.agent(testSetup.app.getHttpServer());
    await session
      .post('/api/private/auth/local/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(loginDto))
      .expect(201);

    // change the password
    await session
      .put('/api/private/auth/local')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          currentPassword: PASSWORD,
          newPassword: 'newPassword',
        }),
      )
      .expect(200);

    // get new session
    session = request.agent(testSetup.app.getHttpServer());

    // not allowed to request profile now
    await session.get('/api/private/me').expect(401);

    // login with new password
    loginDto.password = 'newPassword';
    await session
      .post('/api/private/auth/local/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(loginDto))
      .expect(201);

    // allowed to request profile now
    await session.get('/api/private/me').expect(200);
  });
});
