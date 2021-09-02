/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/no-unsafe-member-access
*/
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';

import { PrivateApiModule } from '../../src/api/private/private-api.module';
import { AuthModule } from '../../src/auth/auth.module';
import { AuthConfig } from '../../src/config/auth.config';
import appConfigMock from '../../src/config/mock/app.config.mock';
import authConfigMock from '../../src/config/mock/auth.config.mock';
import customizationConfigMock from '../../src/config/mock/customization.config.mock';
import externalServicesConfigMock from '../../src/config/mock/external-services.config.mock';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import { GroupsModule } from '../../src/groups/groups.module';
import { HistoryModule } from '../../src/history/history.module';
import { LoginDto } from '../../src/identity/local/login.dto';
import { RegisterDto } from '../../src/identity/local/register.dto';
import { UpdatePasswordDto } from '../../src/identity/local/update-password.dto';
import { LoggerModule } from '../../src/logger/logger.module';
import { MediaModule } from '../../src/media/media.module';
import { NotesModule } from '../../src/notes/notes.module';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { UserRelationEnum } from '../../src/users/user-relation.enum';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { checkPassword } from '../../src/utils/password';
import { setupSessionMiddleware } from '../../src/utils/session';

describe('Auth', () => {
  let app: INestApplication;
  let userService: UsersService;
  let username: string;
  let displayname: string;
  let password: string;
  let config: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            authConfigMock,
            mediaConfigMock,
            customizationConfigMock,
            externalServicesConfigMock,
          ],
        }),
        PrivateApiModule,
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-private-auth.sqlite',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LoggerModule,
        AuthModule,
        UsersModule,
        MediaModule,
        HistoryModule,
      ],
    }).compile();
    config = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    const authConfig = config.get('authConfig') as AuthConfig;
    setupSessionMiddleware(app, authConfig);
    await app.init();
    userService = moduleRef.get(UsersService);
    username = 'hardcoded';
    displayname = 'Testy';
    password = 'test_password';
  });

  describe('POST /auth/local', () => {
    it('works', async () => {
      const registrationDto: RegisterDto = {
        displayname: displayname,
        password: password,
        username: username,
      };
      await request(app.getHttpServer())
        .post('/auth/local')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(registrationDto))
        .expect(201);
      const newUser = await userService.getUserByUsername(username, [
        UserRelationEnum.IDENTITIES,
      ]);
      expect(newUser.displayName).toEqual(displayname);
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
        await userService.createUser(username2, displayname);
        const registrationDto: RegisterDto = {
          displayname: displayname,
          password: password,
          username: username2,
        };
        await request(app.getHttpServer())
          .post('/auth/local')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(registrationDto))
          .expect(400);
      });
      it('when registration is disabled', async () => {
        config.get('authConfig').local.enableRegister = false;
        const registrationDto: RegisterDto = {
          displayname: displayname,
          password: password,
          username: username,
        };
        await request(app.getHttpServer())
          .post('/auth/local')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(registrationDto))
          .expect(400);
        config.get('authConfig').local.enableRegister = true;
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
      const response = await request(app.getHttpServer())
        .post('/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginDto))
        .expect(201);
      cookie = response.get('Set-Cookie')[0];
    });
    it('works', async () => {
      // Change password
      const changePasswordDto: UpdatePasswordDto = {
        newPassword: newPassword,
      };
      await request(app.getHttpServer())
        .put('/auth/local')
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .send(JSON.stringify(changePasswordDto))
        .expect(200);
      // Successfully login with new password
      const loginDto: LoginDto = {
        password: newPassword,
        username: username,
      };
      const response = await request(app.getHttpServer())
        .post('/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginDto))
        .expect(201);
      cookie = response.get('Set-Cookie')[0];
      // Reset password
      const changePasswordBackDto: UpdatePasswordDto = {
        newPassword: password,
      };
      await request(app.getHttpServer())
        .put('/auth/local')
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .send(JSON.stringify(changePasswordBackDto))
        .expect(200);
    });
    it('fails, when registration is disabled', async () => {
      config.get('authConfig').local.enableLogin = false;
      // Try to change password
      const changePasswordDto: UpdatePasswordDto = {
        newPassword: newPassword,
      };
      await request(app.getHttpServer())
        .put('/auth/local')
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .send(JSON.stringify(changePasswordDto))
        .expect(400);
      // enable login again
      config.get('authConfig').local.enableLogin = true;
      // new password doesn't work for login
      const loginNewPasswordDto: LoginDto = {
        password: newPassword,
        username: username,
      };
      await request(app.getHttpServer())
        .post('/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginNewPasswordDto))
        .expect(401);
      // old password does work for login
      const loginOldPasswordDto: LoginDto = {
        password: password,
        username: username,
      };
      await request(app.getHttpServer())
        .post('/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginOldPasswordDto))
        .expect(201);
    });
  });

  describe('POST /auth/local/login', () => {
    it('works', async () => {
      config.get('authConfig').local.enableLogin = true;
      const loginDto: LoginDto = {
        password: password,
        username: username,
      };
      await request(app.getHttpServer())
        .post('/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginDto))
        .expect(201);
    });
  });

  describe('DELETE /auth/logout', () => {
    it('works', async () => {
      config.get('authConfig').local.enableLogin = true;
      const loginDto: LoginDto = {
        password: password,
        username: username,
      };
      const response = await request(app.getHttpServer())
        .post('/auth/local/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(loginDto))
        .expect(201);
      const cookie = response.get('Set-Cookie')[0];
      await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Cookie', cookie)
        .expect(200);
    });
  });
});
