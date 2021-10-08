/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';

import { PrivateApiModule } from '../../src/api/private/private-api.module';
import { AuthModule } from '../../src/auth/auth.module';
import { MockAuthGuard } from '../../src/auth/mock-auth.guard';
import { TokenAuthGuard } from '../../src/auth/token.strategy';
import { AuthConfig } from '../../src/config/auth.config';
import appConfigMock from '../../src/config/mock/app.config.mock';
import authConfigMock from '../../src/config/mock/auth.config.mock';
import customizationConfigMock from '../../src/config/mock/customization.config.mock';
import externalServicesConfigMock from '../../src/config/mock/external-services.config.mock';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import { GroupsModule } from '../../src/groups/groups.module';
import { HistoryModule } from '../../src/history/history.module';
import { IdentityService } from '../../src/identity/identity.service';
import { LoggerModule } from '../../src/logger/logger.module';
import { MediaModule } from '../../src/media/media.module';
import { NotesModule } from '../../src/notes/notes.module';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { User } from '../../src/users/user.entity';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { setupSessionMiddleware } from '../../src/utils/session';

describe('Tokens', () => {
  let app: INestApplication;
  let userService: UsersService;
  let identityService: IdentityService;
  let user: User;
  let agent: request.SuperAgentTest;
  let keyId: string;

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
          database: './hedgedoc-e2e-private-me.sqlite',
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
    })
      .overrideGuard(TokenAuthGuard)
      .useClass(MockAuthGuard)
      .compile();
    const config = moduleRef.get<ConfigService>(ConfigService);
    identityService = moduleRef.get(IdentityService);
    app = moduleRef.createNestApplication();
    userService = moduleRef.get(UsersService);
    user = await userService.createUser('hardcoded', 'Testy');
    await identityService.createLocalIdentity(user, 'test');
    const authConfig = config.get('authConfig') as AuthConfig;
    setupSessionMiddleware(app, authConfig);
    await app.init();
    agent = request.agent(app.getHttpServer());
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
