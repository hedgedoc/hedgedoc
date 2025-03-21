/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/no-unsafe-member-access
*/
import { LoginDto, RegisterDto, UpdatePasswordDto } from '@hedgedoc/commons';
import request from 'supertest';

import { NotInDBError } from '../../src/errors/errors';
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
    // Yes, this is a bad hack, but there is a race somewhere and I have
    // no idea how to fix it.
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
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
      await testSetup.userService.deleteUser(newUser);
    });
    describe('fails', () => {
      it('when the user already exits', async () => {
        const conflictingUserName = 'already_existing';
        const conflictingUser = await testSetup.userService.createUser(
          conflictingUserName,
          displayName,
          null,
          null,
        );
        const registrationDto: RegisterDto = {
          displayName: displayName,
          password: password,
          username: conflictingUserName,
        };
        await request(testSetup.app.getHttpServer())
          .post('/api/private/auth/local')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(registrationDto))
          .expect(409);
        await testSetup.userService.deleteUser(conflictingUser);
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
          .expect(403);
        testSetup.configService.get('authConfig').local.enableRegister = true;
      });
    });
    it('does not create a user if the PasswordTooWeakError is encountered', async () => {
      const registrationDto: RegisterDto = {
        displayName: displayName,
        password: 'test1234',
        username: username,
      };
      const response = await request(testSetup.app.getHttpServer())
        .post('/api/private/auth/local')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(registrationDto))
        .expect(400);
      expect(response.text).toContain('PasswordTooWeakError');
      await expect(() =>
        testSetup.userService.getUserByUsername(username, [
          UserRelationEnum.IDENTITIES,
        ]),
      ).rejects.toThrow(NotInDBError);
    });
  });

  describe('Already existing user', () => {
    beforeAll(async () => {
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
          .expect(403);
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
          .expect(200);
      });
    });
  });
});
