/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* oxlint-disable
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/no-unsafe-member-access
*/
import request from 'supertest';
import { AuthProviderType, FieldNameIdentity, FieldNameUser } from '@hedgedoc/database';
import { checkPassword } from '../../src/utils/password';
import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { LoginDto } from '../../src/dtos/login.dto';
import { NotInDBError } from '../../src/errors/errors';
import { RegisterDto } from '../../src/dtos/register.dto';
import { TestSetup, TestSetupBuilder } from '../test-setup';
import { UpdatePasswordDto } from '../../src/dtos/update-password.dto';
import { extendAgentWithCsrf } from './utils/setup-agent';
import { extractCookieValue } from './utils/cookie';

describe('Auth', () => {
  let testSetup: TestSetup;

  let username: string;
  let displayName: string;
  let password: string;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().build();
    await testSetup.init();

    username = 'hardcoded';
    displayName = 'Testy';
    password = 'test_password';
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe(`POST ${PRIVATE_API_PREFIX}/auth/local`, () => {
    it('creates a user', async () => {
      const registrationDto: RegisterDto = {
        displayName: displayName,
        password: password,
        username: username,
      };
      const originalAgent = request.agent(testSetup.app.getHttpServer());
      const agent = await extendAgentWithCsrf(originalAgent);
      await agent
        .post(`${PRIVATE_API_PREFIX}/auth/local`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(registrationDto))
        .expect(201);
      const newUserId = await testSetup.usersService.getUserIdByUsername(username);
      expect(newUserId).toBeDefined();
      const newUser = await testSetup.usersService.getUserById(newUserId);
      expect(newUser[FieldNameUser.displayName]).toEqual(displayName);
      const newUserIdentity = await testSetup.identityService.getIdentityFromUserIdAndProviderType(
        username,
        AuthProviderType.LOCAL,
        null,
      );
      await expect(
        checkPassword(password, newUserIdentity[FieldNameIdentity.passwordHash] ?? ''),
      ).resolves.toBe(true);
      await testSetup.usersService.deleteUser(newUserId);
    });
    describe('does not create a user', () => {
      it('if the user already exist', async () => {
        const conflictingUserName = 'already_existing';
        const conflictingUser = await testSetup.usersService.createUser(
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
        const originalAgent = request.agent(testSetup.app.getHttpServer());
        const agent = await extendAgentWithCsrf(originalAgent);
        await agent
          .post(`${PRIVATE_API_PREFIX}/auth/local`)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(registrationDto))
          .expect(409);
        await testSetup.usersService.deleteUser(conflictingUser);
      });
      it('if registration is disabled', async () => {
        testSetup.configService.get('authConfig').local.enableRegister = false;
        const registrationDto: RegisterDto = {
          displayName: displayName,
          password: password,
          username: username,
        };
        const originalAgent = request.agent(testSetup.app.getHttpServer());
        const agent = await extendAgentWithCsrf(originalAgent);
        await agent
          .post(`${PRIVATE_API_PREFIX}/auth/local`)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(registrationDto))
          .expect(403);
        testSetup.configService.get('authConfig').local.enableRegister = true;
      });
      it('if the PasswordTooWeakError is encountered', async () => {
        const registrationDto: RegisterDto = {
          displayName: displayName,
          password: 'test1234',
          username: username,
        };
        const originalAgent = request.agent(testSetup.app.getHttpServer());
        const agent = await extendAgentWithCsrf(originalAgent);
        const response = await agent
          .post(`${PRIVATE_API_PREFIX}/auth/local`)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(registrationDto))
          .expect(400);
        expect(response.text).toContain('PasswordTooWeakError');
        await expect(() => testSetup.usersService.getUserDtoByUsername(username)).rejects.toThrow(
          NotInDBError,
        );
      });
    });
  });

  describe('With an already existing user', () => {
    let loggedInAgent: request.SuperAgentTest;
    let cookie: string;

    beforeEach(async () => {
      const registrationDto: RegisterDto = {
        displayName: displayName,
        password: password,
        username: username,
      };
      const originalAgent = request.agent(testSetup.app.getHttpServer());
      const agent = await extendAgentWithCsrf(originalAgent);
      await agent
        .post(`${PRIVATE_API_PREFIX}/auth/local`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(registrationDto))
        .expect(201);
    });
    describe(`PUT ${PRIVATE_API_PREFIX}/auth/local`, () => {
      const newPassword = 'new_password';
      beforeEach(async () => {
        const loginDto: LoginDto = {
          password: password,
          username: username,
        };
        const originalAgent = request.agent(testSetup.app.getHttpServer());
        loggedInAgent = await extendAgentWithCsrf(originalAgent);
        const response = await loggedInAgent
          .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(loginDto))
          .expect(201);
        cookie = response.get('Set-Cookie')[0];
      });
      it('changes the users password', async () => {
        // Change password
        const changePasswordDto: UpdatePasswordDto = {
          currentPassword: password,
          newPassword: newPassword,
        };
        await loggedInAgent
          .put(`${PRIVATE_API_PREFIX}/auth/local`)
          .set('Content-Type', 'application/json')
          .set('Cookie', extractCookieValue(cookie))
          .send(JSON.stringify(changePasswordDto))
          .expect(200);
        // Successfully login with new password
        const loginDto: LoginDto = {
          password: newPassword,
          username: username,
        };
        const response = await loggedInAgent
          .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(loginDto))
          .expect(201);
        cookie = response.get('Set-Cookie')[0];
        // Reset password
        const changePasswordBackDto: UpdatePasswordDto = {
          currentPassword: newPassword,
          newPassword: password,
        };
        await loggedInAgent
          .put(`${PRIVATE_API_PREFIX}/auth/local`)
          .set('Content-Type', 'application/json')
          .set('Cookie', extractCookieValue(cookie))
          .send(JSON.stringify(changePasswordBackDto))
          .expect(200);
      });
      describe('does not change the users password', () => {
        it('if registration is disabled', async () => {
          testSetup.configService.get('authConfig').local.enableLogin = false;
          // Try to change password
          const changePasswordDto: UpdatePasswordDto = {
            currentPassword: password,
            newPassword: newPassword,
          };
          await loggedInAgent
            .put(`${PRIVATE_API_PREFIX}/auth/local`)
            .set('Content-Type', 'application/json')
            .set('Cookie', extractCookieValue(cookie))
            .send(JSON.stringify(changePasswordDto))
            .expect(403);
          // enable login again
          testSetup.configService.get('authConfig').local.enableLogin = true;
          // new password doesn't work for login
          const loginNewPasswordDto: LoginDto = {
            password: newPassword,
            username: username,
          };
          await loggedInAgent
            .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(loginNewPasswordDto))
            .expect(401);
          // old password does work for login
          const loginOldPasswordDto: LoginDto = {
            password: password,
            username: username,
          };
          await loggedInAgent
            .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(loginOldPasswordDto))
            .expect(201);
        });
        it('if old password is wrong', async () => {
          // Try to change password
          const changePasswordDto: UpdatePasswordDto = {
            currentPassword: 'wrong_password',
            newPassword: newPassword,
          };
          await loggedInAgent
            .put(`${PRIVATE_API_PREFIX}/auth/local`)
            .set('Content-Type', 'application/json')
            .set('Cookie', extractCookieValue(cookie))
            .send(JSON.stringify(changePasswordDto))
            .expect(401);
          // old password still does work for login
          const loginOldPasswordDto: LoginDto = {
            password: password,
            username: username,
          };
          loggedInAgent
            .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(loginOldPasswordDto))
            .expect(201);
        });
        it('if new or old password is too short', async () => {
          // Try to change password
          const changePasswordDtoOldPwTooShort: UpdatePasswordDto = {
            currentPassword: 'wrong',
            newPassword: newPassword,
          };
          await loggedInAgent
            .put(`${PRIVATE_API_PREFIX}/auth/local`)
            .set('Content-Type', 'application/json')
            .set('Cookie', extractCookieValue(cookie))
            .send(JSON.stringify(changePasswordDtoOldPwTooShort))
            .expect(400);

          const changePasswordDtoNewPwTooShort: UpdatePasswordDto = {
            currentPassword: password,
            newPassword: 'new',
          };
          await loggedInAgent
            .put(`${PRIVATE_API_PREFIX}/auth/local`)
            .set('Content-Type', 'application/json')
            .set('Cookie', extractCookieValue(cookie))
            .send(JSON.stringify(changePasswordDtoNewPwTooShort))
            .expect(400);

          // old password still does work for login
          const loginOldPasswordDto: LoginDto = {
            password: password,
            username: username,
          };
          await loggedInAgent
            .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(loginOldPasswordDto))
            .expect(201);
        });
      });
    });

    describe(`POST ${PRIVATE_API_PREFIX}/auth/local/login`, () => {
      it('works', async () => {
        testSetup.configService.get('authConfig').local.enableLogin = true;
        const loginDto: LoginDto = {
          password: password,
          username: username,
        };
        const originalAgent = request.agent(testSetup.app.getHttpServer());
        const agent = await extendAgentWithCsrf(originalAgent);
        await agent
          .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(loginDto))
          .expect(201);
      });
    });

    describe(`DELETE ${PRIVATE_API_PREFIX}/auth/logout`, () => {
      it('works', async () => {
        testSetup.configService.get('authConfig').local.enableLogin = true;
        const loginDto: LoginDto = {
          password: password,
          username: username,
        };
        const originalAgent = request.agent(testSetup.app.getHttpServer());
        const agent = await extendAgentWithCsrf(originalAgent);
        const response = await agent
          .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(loginDto))
          .expect(201);
        const cookie = response.get('Set-Cookie')[0];
        await agent
          .delete(`${PRIVATE_API_PREFIX}/auth/logout`)
          .set('Cookie', extractCookieValue(cookie))
          .expect(200);
      });
    });
  });
});
