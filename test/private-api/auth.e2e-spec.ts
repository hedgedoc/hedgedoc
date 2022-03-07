/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/no-unsafe-member-access
*/
import request from 'supertest';

import { LoginDto } from '../../src/identity/local/login.dto';
import { RegisterDto } from '../../src/identity/local/register.dto';
import { UpdatePasswordDto } from '../../src/identity/local/update-password.dto';
import { UserRelationEnum } from '../../src/users/user-relation.enum';
import { checkPassword } from '../../src/utils/password';
import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Auth', () => {
  let testSetup: TestSetup;

  let username: string;
  let displayName: string;
  let password: string;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().build();
    await testSetup.app.init();

    username = 'hardcoded';
    displayName = 'Testy';
    password = 'test_password';
  });

  afterAll(async () => {
    await testSetup.cleanup();
  });

  describe('POST /auth/local', () => {
    it('works', async () => {
      const registrationDto: RegisterDto = {
        displayName: displayName,
        password: password,
        username: username,
      };
      await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(registrationDto))
        .expect(201);
      const newUser = await testSetup.userService.getUserByUsername(username, [
        UserRelationEnum.IDENTITIES,
      ]);
      expect(newUser.displayName).toEqual(displayName);
      await expect(newUser.identities).resolves.toHaveLength(1);
      await expect(
        checkPassword(
          password,
          (await newUser.identities)[0].passwordHash ?? '',
        ),
      ).resolves.toBeTruthy();
    });
    describe('fails', () => {
      it('when the user already exits', async () => {
        const username2 = 'already_existing';
        await testSetup.userService.createUser(username2, displayName);
        const registrationDto: RegisterDto = {
          displayName: displayName,
          password: password,
          username: username2,
        };
        await request(testSetup.app.getHttpServer())
          .post('/api/private/auth/local')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(registrationDto))
          .expect(409);
      });
      it('when registration is disabled', async () => {
        testSetup.configService.get('authConfig').local.enableRegister = false;
        const registrationDto: RegisterDto = {
          displayName: displayName,
          password: password,
          username: username,
        };
        await request(testSetup.app.getHttpServer())
          .post('/api/private/auth/local')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(registrationDto))
          .expect(400);
        testSetup.configService.get('authConfig').local.enableRegister = true;
      });
    });
  });

  describe('PUT /auth/local', () => {
    const newPassword = 'new_password';
    let cookie = '';
    beforeEach(async () => {
      const loginDto: LoginDto = {
        password: password,
        username: username,
      };
      const response = await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginDto))
        .expect(201);
      cookie = response.get('Set-Cookie')[0];
    });
    it('works', async () => {
      // Change password
      const changePasswordDto: UpdatePasswordDto = {
        currentPassword: password,
        newPassword: newPassword,
      };
      await request(testSetup.app.getHttpServer())
        .put('/api/private/auth/local')
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .send(JSON.stringify(changePasswordDto))
        .expect(200);
      // Successfully login with new password
      const loginDto: LoginDto = {
        password: newPassword,
        username: username,
      };
      const response = await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginDto))
        .expect(201);
      cookie = response.get('Set-Cookie')[0];
      // Reset password
      const changePasswordBackDto: UpdatePasswordDto = {
        currentPassword: newPassword,
        newPassword: password,
      };
      await request(testSetup.app.getHttpServer())
        .put('/api/private/auth/local')
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .send(JSON.stringify(changePasswordBackDto))
        .expect(200);
    });
    it('fails, when registration is disabled', async () => {
      testSetup.configService.get('authConfig').local.enableLogin = false;
      // Try to change password
      const changePasswordDto: UpdatePasswordDto = {
        currentPassword: password,
        newPassword: newPassword,
      };
      await request(testSetup.app.getHttpServer())
        .put('/api/private/auth/local')
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .send(JSON.stringify(changePasswordDto))
        .expect(400);
      // enable login again
      testSetup.configService.get('authConfig').local.enableLogin = true;
      // new password doesn't work for login
      const loginNewPasswordDto: LoginDto = {
        password: newPassword,
        username: username,
      };
      await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginNewPasswordDto))
        .expect(401);
      // old password does work for login
      const loginOldPasswordDto: LoginDto = {
        password: password,
        username: username,
      };
      await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginOldPasswordDto))
        .expect(201);
    });
    it('fails, when old password is wrong', async () => {
      // Try to change password
      const changePasswordDto: UpdatePasswordDto = {
        currentPassword: 'wrong',
        newPassword: newPassword,
      };
      await request(testSetup.app.getHttpServer())
        .put('/api/private/auth/local')
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .send(JSON.stringify(changePasswordDto))
        .expect(401);
      // old password still does work for login
      const loginOldPasswordDto: LoginDto = {
        password: password,
        username: username,
      };
      await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginOldPasswordDto))
        .expect(201);
    });
  });

  describe('POST /auth/local/login', () => {
    it('works', async () => {
      testSetup.configService.get('authConfig').local.enableLogin = true;
      const loginDto: LoginDto = {
        password: password,
        username: username,
      };
      await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginDto))
        .expect(201);
    });
  });

  describe('DELETE /auth/logout', () => {
    it('works', async () => {
      testSetup.configService.get('authConfig').local.enableLogin = true;
      const loginDto: LoginDto = {
        password: password,
        username: username,
      };
      const response = await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginDto))
        .expect(201);
      const cookie = response.get('Set-Cookie')[0];
      await request(testSetup.app.getHttpServer())
        .delete('/api/private/auth/logout')
        .set('Cookie', cookie)
        .expect(204);
    });
  });
});
