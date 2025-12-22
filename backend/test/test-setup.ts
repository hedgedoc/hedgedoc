/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SpecialGroup } from '@hedgedoc/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE, RouterModule, Routes } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import knex, { Knex } from 'knex';
import { KnexModule } from 'nest-knexjs';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { types as pgTypes } from 'pg';
import { v4 as uuidv4 } from 'uuid';

import { AliasModule } from '../src/alias/alias.module';
import { AliasService } from '../src/alias/alias.service';
import { ApiTokenModule } from '../src/api-token/api-token.module';
import { ApiTokenService } from '../src/api-token/api-token.service';
import { PrivateApiModule } from '../src/api/private/private-api.module';
import { PublicApiModule } from '../src/api/public/public-api.module';
import { ApiTokenGuard } from '../src/api/utils/guards/api-token.guard';
import { MockApiTokenGuard } from '../src/api/utils/guards/mock-api-token.guard';
import { setupApp } from '../src/app-init';
import { PRIVATE_API_PREFIX, PUBLIC_API_PREFIX } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';
import { IdentityService } from '../src/auth/identity.service';
import { LdapService } from '../src/auth/ldap/ldap.service';
import { LocalService } from '../src/auth/local/local.service';
import { OidcService } from '../src/auth/oidc/oidc.service';
import { AppConfig } from '../src/config/app.config';
import { AuthConfig } from '../src/config/auth.config';
import { CustomizationConfig } from '../src/config/customization.config';
import { DatabaseConfig } from '../src/config/database.config';
import { ExternalServicesConfig } from '../src/config/external-services.config';
import { MediaConfig } from '../src/config/media.config';
import {
  createDefaultMockAppConfig,
  registerAppConfig,
} from '../src/config/mock/app.config.mock';
import {
  createDefaultMockAuthConfig,
  registerAuthConfig,
} from '../src/config/mock/auth.config.mock';
import {
  createDefaultMockCustomizationConfig,
  registerCustomizationConfig,
} from '../src/config/mock/customization.config.mock';
import {
  createDefaultMockDatabaseConfig,
  registerDatabaseConfig,
} from '../src/config/mock/database.config.mock';
import {
  createDefaultMockExternalServicesConfig,
  registerExternalServiceConfig,
} from '../src/config/mock/external-services.config.mock';
import {
  createDefaultMockMediaConfig,
  registerMediaConfig,
} from '../src/config/mock/media.config.mock';
import {
  createDefaultMockNoteConfig,
  registerNoteConfig,
} from '../src/config/mock/note.config.mock';
import { NoteConfig } from '../src/config/note.config';
import { ApiTokenWithSecretDto } from '../src/dtos/api-token-with-secret.dto';
import { eventModuleConfig } from '../src/events';
import { ExploreService } from '../src/explore/explore.service';
import { FrontendConfigModule } from '../src/frontend-config/frontend-config.module';
import { GroupsModule } from '../src/groups/groups.module';
import { GroupsService } from '../src/groups/groups.service';
import { ConsoleLoggerService } from '../src/logger/console-logger.service';
import { LoggerModule } from '../src/logger/logger.module';
import { FilesystemBackend } from '../src/media/backends/filesystem-backend';
import { MediaModule } from '../src/media/media.module';
import { MediaService } from '../src/media/media.service';
import { MonitoringModule } from '../src/monitoring/monitoring.module';
import { NoteService } from '../src/notes/note.service';
import { PermissionService } from '../src/permissions/permission.service';
import { PermissionsModule } from '../src/permissions/permissions.module';
import { RevisionsModule } from '../src/revisions/revisions.module';
import { RevisionsService } from '../src/revisions/revisions.service';
import { SessionModule } from '../src/sessions/session.module';
import { SessionService } from '../src/sessions/session.service';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';
import { getCurrentDateTime } from '../src/utils/datetime';

interface CreateTestSetupParameters {
  appConfigMock?: AppConfig;
  authConfigMock?: AuthConfig;
  customizationConfigMock?: CustomizationConfig;
  databaseConfigMock?: DatabaseConfig;
  externalServicesConfigMock?: ExternalServicesConfig;
  mediaConfigMock?: MediaConfig;
  noteConfigMock?: NoteConfig;
}

export class TestSetup {
  moduleRef: TestingModule;
  app: NestExpressApplication;
  knexInstance: Knex;

  usersService: UsersService;
  groupService: GroupsService;
  configService: ConfigService;
  identityService: IdentityService;
  localIdentityService: LocalService;
  ldapService: LdapService;
  oidcService: OidcService;
  notesService: NoteService;
  mediaService: MediaService;
  aliasService: AliasService;
  apiTokenService: ApiTokenService;
  sessionService: SessionService;
  revisionsService: RevisionsService;
  exploreService: ExploreService;

  userIds: number[] = [];
  guestUserId: number;
  guestUserUuid: string;
  authTokens: ApiTokenWithSecretDto[] = [];
  anonymousNoteIds: number[] = [];
  ownedNoteIds: number[] = [];
  permissionsService: PermissionService;

  /**
   * Cleans up remnants from a test run from the database
   */
  public async cleanup() {
    if (this.knexInstance) {
      await this.knexInstance.destroy();
    }
    await this.app.close();
  }
}

/**
 * Builder class for TestSetup
 * Should be instantiated with the create() method
 * The usable TestSetup is generated using build()
 */
export class TestSetupBuilder {
  // list of functions that should be executed before or after building the TestingModule
  private setupPreCompile: (() => Promise<void>)[] = [];
  private setupPostCompile: (() => Promise<void>)[] = [];

  private testingModuleBuilder: TestingModuleBuilder;
  private testSetup = new TestSetup();

  private testId: string;

  /**
   * Prepares a test database
   * @param dbName The name of the database to use
   */
  private static async createTestDatabase(dbName: string) {
    const dbType = process.env.HEDGEDOC_TEST_DB_TYPE || 'sqlite';
    // we need to use this low-level way of writing to get the message to the output without getting
    // a lot of extra output about using console.log
    process.stdout.write(`Using dbname ${dbName} (${dbType})\n`);
    if (dbType === 'sqlite') {
      return;
    }
    const knexConfig = this.getTestDatabaseConfig(dbName, true);
    const adminKnex = knex(knexConfig);
    await adminKnex.raw(`DROP DATABASE IF EXISTS ${dbName}`);
    await adminKnex.raw(`CREATE DATABASE ${dbName}`);
    if (dbType === 'mariadb') {
      await adminKnex.raw(
        `GRANT ALL PRIVILEGES ON ${dbName}.* TO 'hedgedoc'@'%'`,
      );
    }
    await adminKnex.destroy();
  }

  /**
   * Returns the database configuration for the test database
   *
   * @param dbName The name of the database to use
   * @param asAdmin If the database should be connected to as the admin user
   * @returns The database configuration
   */
  private static getTestDatabaseConfig(
    dbName: string,
    asAdmin = false,
  ): Knex.Config {
    const dbType = process.env.HEDGEDOC_TEST_DB_TYPE || 'sqlite';
    switch (dbType) {
      case 'sqlite':
        return {
          client: 'better-sqlite3',
          connection: { filename: ':memory:' },
          useNullAsDefault: true,
        };
      case 'postgres':
        pgTypes.setTypeParser(
          pgTypes.builtins.TIMESTAMP,
          (value: string) => value,
        );
        pgTypes.setTypeParser(
          pgTypes.builtins.TIMESTAMPTZ,
          (value: string) => value,
        );
        return {
          client: 'pg',
          connection: {
            database: asAdmin ? 'postgres' : dbName,
            user: 'hedgedoc',
            password: 'hedgedoc',
            host: process.env.HD_DATABASE_HOST || 'localhost',
            port: parseInt(process.env.HD_DATABASE_PORT || '5432'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            application_name: 'HedgeDoc Test Server',
          },
        };
      case 'mariadb':
        return {
          client: 'mysql2',
          connection: {
            database: asAdmin ? 'hedgedoc' : dbName,
            user: asAdmin ? 'root' : 'hedgedoc',
            password: 'hedgedoc',
            host: process.env.HD_DATABASE_HOST || 'localhost',
            port: parseInt(process.env.HD_DATABASE_PORT || '3306'),
            dateStrings: true,
          },
        };
      default:
        throw new Error('Unknown database type in HEDGEDOC_TEST_DB_TYPE');
    }
  }

  /**
   * Creates a new instance of TestSetupBuilder
   */
  public static create(mocks?: CreateTestSetupParameters): TestSetupBuilder {
    const testSetupBuilder = new TestSetupBuilder();
    const testId = `hedgedoc_test_${uuidv4()}`.replaceAll('-', '_');
    testSetupBuilder.testId = testId;

    const routes: Routes = [
      {
        path: PUBLIC_API_PREFIX,
        module: PublicApiModule,
      },
      {
        path: PRIVATE_API_PREFIX,
        module: PrivateApiModule,
      },
    ];
    process.env.HD_BASE_URL = `https://${testId}.example.com`;

    const knexConfig = TestSetupBuilder.getTestDatabaseConfig(testId);
    testSetupBuilder.testingModuleBuilder = Test.createTestingModule({
      imports: [
        RouterModule.register(routes),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            registerAppConfig(
              mocks?.appConfigMock ?? createDefaultMockAppConfig(),
            ),
            registerAuthConfig(
              mocks?.authConfigMock ?? createDefaultMockAuthConfig(),
            ),
            registerCustomizationConfig(
              mocks?.customizationConfigMock ??
                createDefaultMockCustomizationConfig(),
            ),
            registerDatabaseConfig(
              mocks?.databaseConfigMock ?? createDefaultMockDatabaseConfig(),
            ),
            registerExternalServiceConfig(
              mocks?.externalServicesConfigMock ??
                createDefaultMockExternalServicesConfig(),
            ),
            registerMediaConfig(
              mocks?.mediaConfigMock ?? createDefaultMockMediaConfig(),
            ),
            registerNoteConfig(
              mocks?.noteConfigMock ?? createDefaultMockNoteConfig(),
            ),
          ],
        }),
        KnexModule.forRoot({
          config: {
            ...knexConfig,
            migrations: {
              directory: 'src/database/migrations/',
            },
          },
        }),
        AliasModule,
        UsersModule,
        RevisionsModule,
        PublicApiModule,
        PrivateApiModule,
        MonitoringModule,
        PermissionsModule,
        GroupsModule,
        LoggerModule,
        MediaModule,
        ApiTokenModule,
        FrontendConfigModule,
        AuthModule,
        SessionModule,
        EventEmitterModule.forRoot(eventModuleConfig),
      ],
      providers: [
        {
          provide: APP_PIPE,
          useClass: ZodValidationPipe,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ZodSerializerInterceptor,
        },
      ],
    });
    return testSetupBuilder;
  }

  /**
   * Builds the final TestSetup from the configured builder
   */
  public async build(): Promise<TestSetup> {
    await TestSetupBuilder.createTestDatabase(this.testId);

    for (const setupFunction of this.setupPreCompile) {
      await setupFunction();
    }

    this.testSetup.moduleRef = await this.testingModuleBuilder.compile();

    this.testSetup.usersService =
      this.testSetup.moduleRef.get<UsersService>(UsersService);
    this.testSetup.groupService =
      this.testSetup.moduleRef.get<GroupsService>(GroupsService);
    this.testSetup.configService =
      this.testSetup.moduleRef.get<ConfigService>(ConfigService);
    this.testSetup.identityService =
      this.testSetup.moduleRef.get<IdentityService>(IdentityService);
    this.testSetup.localIdentityService =
      this.testSetup.moduleRef.get<LocalService>(LocalService);
    this.testSetup.notesService =
      this.testSetup.moduleRef.get<NoteService>(NoteService);
    const filesystemBackend =
      this.testSetup.moduleRef.get<FilesystemBackend>(FilesystemBackend);
    this.testSetup.mediaService =
      this.testSetup.moduleRef.get<MediaService>(MediaService);
    this.testSetup.mediaService.mediaBackend = filesystemBackend;
    this.testSetup.aliasService =
      this.testSetup.moduleRef.get<AliasService>(AliasService);
    this.testSetup.apiTokenService =
      this.testSetup.moduleRef.get<ApiTokenService>(ApiTokenService);
    this.testSetup.permissionsService =
      this.testSetup.moduleRef.get<PermissionService>(PermissionService);
    this.testSetup.sessionService =
      this.testSetup.moduleRef.get<SessionService>(SessionService);
    this.testSetup.revisionsService =
      this.testSetup.moduleRef.get<RevisionsService>(RevisionsService);
    this.testSetup.ldapService =
      this.testSetup.moduleRef.get<LdapService>(LdapService);
    this.testSetup.oidcService =
      this.testSetup.moduleRef.get<OidcService>(OidcService);
    this.testSetup.exploreService =
      this.testSetup.moduleRef.get<ExploreService>(ExploreService);

    this.testSetup.app = this.testSetup.moduleRef.createNestApplication();

    await setupApp(
      this.testSetup.app,
      this.testSetup.configService.get<AppConfig>('appConfig'),
      this.testSetup.configService.get<AuthConfig>('authConfig'),
      this.testSetup.configService.get<MediaConfig>('mediaConfig'),
      await this.testSetup.app.resolve(ConsoleLoggerService),
    );

    for (const setupFunction of this.setupPostCompile) {
      await setupFunction();
    }
    return this.testSetup;
  }

  /**
   * Enable mock authentication for the public API
   */
  public withMockAuth() {
    this.setupPreCompile.push(() => {
      this.testingModuleBuilder
        .overrideGuard(ApiTokenGuard)
        .useClass(MockApiTokenGuard);
      return Promise.resolve();
    });
    return this;
  }

  /**
   * Generate a few users, identities and auth tokens for testing
   */
  public withUsers() {
    this.setupPostCompile.push(async () => {
      // Create users
      this.testSetup.userIds.push(
        await this.testSetup.localIdentityService.createUserWithLocalIdentity(
          username1,
          password1,
          displayName1,
        ),
      );
      this.testSetup.userIds.push(
        await this.testSetup.localIdentityService.createUserWithLocalIdentity(
          username2,
          password2,
          displayName2,
        ),
      );
      this.testSetup.userIds.push(
        await this.testSetup.localIdentityService.createUserWithLocalIdentity(
          username3,
          password3,
          displayName3,
        ),
      );

      // create auth tokens
      this.testSetup.authTokens = await Promise.all(
        this.testSetup.userIds.map(async (userId) => {
          // Token is valid for 1 hour
          const validUntil = getCurrentDateTime().plus({
            hour: 1,
          });
          return await this.testSetup.apiTokenService.createToken(
            userId,
            'test',
            validUntil,
          );
        }),
      );

      // create notes owned by the test users
      this.testSetup.ownedNoteIds.push(
        await this.testSetup.notesService.createNote(
          noteContent1,
          this.testSetup.userIds[0],
          noteAlias1,
        ),
      );
      this.testSetup.ownedNoteIds.push(
        await this.testSetup.notesService.createNote(
          noteContent2,
          this.testSetup.userIds[1],
          noteAlias2,
        ),
      );
      this.testSetup.ownedNoteIds.push(
        await this.testSetup.notesService.createNote(
          noteContent3,
          this.testSetup.userIds[2],
          noteAlias3,
        ),
      );
      this.testSetup.ownedNoteIds.push(
        await this.testSetup.notesService.createNote(
          noteContent4,
          this.testSetup.userIds[0],
          noteAlias4,
        ),
      );
      await this.testSetup.permissionsService.removeGroupPermission(
        this.testSetup.ownedNoteIds[3],
        await this.testSetup.groupService.getGroupIdByName(
          SpecialGroup.EVERYONE,
        ),
      );
      await this.testSetup.permissionsService.removeGroupPermission(
        this.testSetup.ownedNoteIds[3],
        await this.testSetup.groupService.getGroupIdByName(
          SpecialGroup.LOGGED_IN,
        ),
      );
    });
    return this;
  }

  /**
   * Generate a few anonymous notes for testing
   */
  public withNotes(): TestSetupBuilder {
    this.setupPostCompile.push(async () => {
      [this.testSetup.guestUserUuid, this.testSetup.guestUserId] =
        await this.testSetup.usersService.createGuestUser();
      this.testSetup.anonymousNoteIds.push(
        await this.testSetup.notesService.createNote(
          anonymousNoteContent1,
          this.testSetup.guestUserId,
          anonymousNoteAlias1,
        ),
      );
      this.testSetup.anonymousNoteIds.push(
        await this.testSetup.notesService.createNote(
          anonymousNoteContent2,
          this.testSetup.guestUserId,
          anonymousNoteAlias2,
        ),
      );
      this.testSetup.anonymousNoteIds.push(
        await this.testSetup.notesService.createNote(
          anonymousNoteContent3,
          this.testSetup.guestUserId,
          anonymousNoteAlias3,
        ),
      );
    });
    return this;
  }
}

export const username1 = 'testuser1';
export const password1 = 'AStrongP@sswordForUser1';
export const displayName1 = 'Test User 1';
export const username2 = 'testuser2';
export const password2 = 'AStrongP@sswordForUser2';
export const displayName2 = 'Test User 2';
export const username3 = 'testuser3';
export const password3 = 'AStrongP@sswordForUser3';
export const displayName3 = 'Test User 3';

export const anonymousNoteAlias1 = 'anonymousNoteId1';
export const anonymousNoteContent1 = 'Anonymous Note 1';
export const anonymousNoteAlias2 = 'anonymousNoteId2';
export const anonymousNoteContent2 = 'Anonymous Note 2';
export const anonymousNoteAlias3 = 'anonymousNoteId3';
export const anonymousNoteContent3 = 'Anonymous Note 3';
export const noteAlias1 = 'testAlias1';
export const noteContent1 = 'Test Note 1';
export const noteAlias2 = 'testAlias2';
export const noteContent2 = '# Test Note 2';
export const noteAlias3 = 'testAlias3';
export const noteContent3 = '---\ntype: slide\n---\nTest Note 3';
export const noteAlias4 = 'testAlias4';
export const noteContent4 = 'Test Note 4';
