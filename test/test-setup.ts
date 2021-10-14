/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PrivateApiModule } from '../src/api/private/private-api.module';
import { PublicApiModule } from '../src/api/public/public-api.module';
import { AuthModule } from '../src/auth/auth.module';
import { MockAuthGuard } from '../src/auth/mock-auth.guard';
import { TokenAuthGuard } from '../src/auth/token.strategy';
import appConfigMock from '../src/config/mock/app.config.mock';
import authConfigMock from '../src/config/mock/auth.config.mock';
import customizationConfigMock from '../src/config/mock/customization.config.mock';
import externalServicesConfigMock from '../src/config/mock/external-services.config.mock';
import mediaConfigMock from '../src/config/mock/media.config.mock';
import { GroupsModule } from '../src/groups/groups.module';
import { HistoryModule } from '../src/history/history.module';
import { IdentityService } from '../src/identity/identity.service';
import { LoggerModule } from '../src/logger/logger.module';
import { MediaModule } from '../src/media/media.module';
import { MediaService } from '../src/media/media.service';
import { NotesModule } from '../src/notes/notes.module';
import { NotesService } from '../src/notes/notes.service';
import { PermissionsModule } from '../src/permissions/permissions.module';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';

export class TestSetup {
  moduleRef: TestingModule;
  app: INestApplication;

  userService: UsersService;
  configService: ConfigService;
  identityService: IdentityService;
  notesService: NotesService;
  mediaService: MediaService;

  public static async create(): Promise<TestSetup> {
    const testSetup = new TestSetup();

    testSetup.moduleRef = await Test.createTestingModule({
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
        PublicApiModule,
        PrivateApiModule,
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
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

    testSetup.userService = testSetup.moduleRef.get<UsersService>(UsersService);
    testSetup.configService =
      testSetup.moduleRef.get<ConfigService>(ConfigService);
    testSetup.identityService =
      testSetup.moduleRef.get<IdentityService>(IdentityService);
    testSetup.notesService =
      testSetup.moduleRef.get<NotesService>(NotesService);
    testSetup.mediaService =
      testSetup.moduleRef.get<MediaService>(MediaService);

    testSetup.app = testSetup.moduleRef.createNestApplication();

    return testSetup;
  }
}
