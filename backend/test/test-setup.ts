/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiTokenWithSecretDto } from '@hedgedoc/commons';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterModule, Routes } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection, createConnection } from 'typeorm';

import { ApiTokenGuard } from '../src/api-token/api-token.guard';
import { ApiTokenModule } from '../src/api-token/api-token.module';
import { ApiTokenService } from '../src/api-token/api-token.service';
import { MockApiTokenGuard } from '../src/api-token/mock-api-token.guard';
import { PrivateApiModule } from '../src/api/private/private-api.module';
import { PublicApiModule } from '../src/api/public/public-api.module';
import { setupApp } from '../src/app-init';
import { AuthModule } from '../src/auth/auth.module';
import { IdentityService } from '../src/auth/identity.service';
import { LdapService } from '../src/auth/ldap/ldap.service';
import { LocalService } from '../src/auth/local/local.service';
import { OidcService } from '../src/auth/oidc/oidc.service';
import { AuthorsModule } from '../src/authors/authors.module';
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
import { ErrorExceptionMapping } from '../src/errors/error-mapping';
import { eventModuleConfig } from '../src/events';
import { FrontendConfigModule } from '../src/frontend-config/frontend-config.module';
import { GroupsModule } from '../src/groups/groups.module';
import { GroupsService } from '../src/groups/groups.service';
import { HistoryModule } from '../src/history/history.module';
import { HistoryService } from '../src/history/history.service';
import { ConsoleLoggerService } from '../src/logger/console-logger.service';
import { LoggerModule } from '../src/logger/logger.module';
import { MediaModule } from '../src/media/media.module';
import { MediaService } from '../src/media/media.service';
import { MonitoringModule } from '../src/monitoring/monitoring.module';
import { AliasService } from '../src/notes/alias.service';
import { Note } from '../src/notes/note.entity';
import { NotesModule } from '../src/notes/notes.module';
import { NotesService } from '../src/notes/notes.service';
import { PermissionsModule } from '../src/permissions/permissions.module';
import { PermissionsService } from '../src/permissions/permissions.service';
import { RevisionsModule } from '../src/revisions/revisions.module';
import { RevisionsService } from '../src/revisions/revisions.service';
import { SessionModule } from '../src/sessions/session.module';
import { SessionService } from '../src/sessions/session.service';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';

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

  userService: UsersService;
  groupService: GroupsService;
  configService: ConfigService;
  identityService: IdentityService;
  localIdentityService: LocalService;
  ldapService: LdapService;
  oidcService: OidcService;
  notesService: NotesService;
  mediaService: MediaService;
  historyService: HistoryService;
  aliasService: AliasService;
  publicAuthTokenService: ApiTokenService;
  sessionService: SessionService;
  revisionsService: RevisionsService;

  users: User[] = [];
  authTokens: ApiTokenWithSecretDto[] = [];
  anonymousNotes: Note[] = [];
  ownedNotes: Note[] = [];
  permissionsService: PermissionsService;

  /**
   * Cleans up remnants from a test run from the database
   */
  public async cleanup() {
    const appConnection = this.app.get<Connection>(Connection);
    const connectionOptions = appConnection.options;
    if (!connectionOptions.database) {
      throw new Error('Database name not set in connection options');
    }
    if (connectionOptions.type === 'sqlite') {
      // Bail out early, as SQLite runs from memory anyway
      await this.app.close();
      return;
    }
    if (appConnection.isConnected) {
      await appConnection.close();
    }
    switch (connectionOptions.type) {
      case 'postgres':
      case 'mariadb': {
        const connection = await createConnection({
          type: connectionOptions.type,
          username: 'hedgedoc',
          password: 'hedgedoc',
        });
        await connection.query(`DROP DATABASE ${connectionOptions.database}`);
        await connection.close();
      }
    }
    await this.app.close();
  }
}

/**
 * Builder class for TestSetup
 * Should be instantiated with the create() method
 * The useable TestSetup is genereated using build()
 */
export class TestSetupBuilder {
  // list of functions that should be executed before or after builing the TestingModule
  private setupPreCompile: (() => Promise<void>)[] = [];
  private setupPostCompile: (() => Promise<void>)[] = [];

  private testingModuleBuilder: TestingModuleBuilder;
  private testSetup = new TestSetup();

  private testId: string;

  /**
   * Prepares a test database
   * @param dbName The name of the database to use
   * @private
   */
  private static async setupTestDB(dbName: string) {
    const dbType = process.env.HEDGEDOC_TEST_DB_TYPE;
    if (!dbType || dbType === 'sqlite') {
      return;
    }

    if (!['postgres', 'mariadb'].includes(dbType)) {
      throw new Error('Unknown database type in HEDGEDOC_TEST_DB_TYPE');
    }

    const connection = await createConnection({
      type: dbType as 'postgres' | 'mariadb',
      username: dbType === 'mariadb' ? 'root' : 'hedgedoc',
      password: 'hedgedoc',
    });

    await connection.query(`CREATE DATABASE ${dbName}`);
    if (dbType === 'mariadb') {
      await connection.query(
        `GRANT ALL PRIVILEGES ON ${dbName}.* TO 'hedgedoc'@'%'`,
      );
    }
    await connection.close();
  }

  private static getTestDBConf(dbName: string): TypeOrmModuleOptions {
    switch (process.env.HEDGEDOC_TEST_DB_TYPE || 'sqlite') {
      case 'sqlite':
        return {
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          dropSchema: true,
          migrations: [`src/migrations/sqlite-*.ts`],
          migrationsRun: true,
        };
      case 'postgres':
      case 'mariadb':
        return {
          type: process.env.HEDGEDOC_TEST_DB_TYPE as 'postgres' | 'mariadb',
          database: dbName,
          username: 'hedgedoc',
          password: 'hedgedoc',
          autoLoadEntities: true,
          dropSchema: true,
          migrations: [
            `src/migrations/${process.env.HEDGEDOC_TEST_DB_TYPE}-*.ts`,
          ],
          migrationsRun: true,
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
    testSetupBuilder.testId =
      'hedgedoc_test_' + Math.random().toString(36).substring(2, 15);
    const routes: Routes = [
      {
        path: '/api/v2',
        module: PublicApiModule,
      },
      {
        path: '/api/private',
        module: PrivateApiModule,
      },
    ];
    process.env.HD_BASE_URL =
      'https://md-' + testSetupBuilder.testId + '.example.com';
    testSetupBuilder.testingModuleBuilder = Test.createTestingModule({
      imports: [
        RouterModule.register(routes),
        TypeOrmModule.forRoot(
          TestSetupBuilder.getTestDBConf(testSetupBuilder.testId),
        ),
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
        NotesModule,
        UsersModule,
        RevisionsModule,
        AuthorsModule,
        PublicApiModule,
        PrivateApiModule,
        HistoryModule,
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
          provide: 'APP_FILTER',
          useClass: ErrorExceptionMapping,
        },
      ],
    });
    return testSetupBuilder;
  }

  /**
   * Builds the final TestSetup from the configured builder
   */
  public async build(): Promise<TestSetup> {
    await TestSetupBuilder.setupTestDB(this.testId);

    for (const setupFunction of this.setupPreCompile) {
      await setupFunction();
    }

    this.testSetup.moduleRef = await this.testingModuleBuilder.compile();

    this.testSetup.userService =
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
      this.testSetup.moduleRef.get<NotesService>(NotesService);
    this.testSetup.mediaService =
      this.testSetup.moduleRef.get<MediaService>(MediaService);
    this.testSetup.historyService =
      this.testSetup.moduleRef.get<HistoryService>(HistoryService);
    this.testSetup.aliasService =
      this.testSetup.moduleRef.get<AliasService>(AliasService);
    this.testSetup.publicAuthTokenService =
      this.testSetup.moduleRef.get<ApiTokenService>(ApiTokenService);
    this.testSetup.permissionsService =
      this.testSetup.moduleRef.get<PermissionsService>(PermissionsService);
    this.testSetup.sessionService =
      this.testSetup.moduleRef.get<SessionService>(SessionService);
    this.testSetup.revisionsService =
      this.testSetup.moduleRef.get<RevisionsService>(RevisionsService);
    this.testSetup.ldapService =
      this.testSetup.moduleRef.get<LdapService>(LdapService);
    this.testSetup.oidcService =
      this.testSetup.moduleRef.get<OidcService>(OidcService);

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
    this.setupPreCompile.push(async () => {
      this.testingModuleBuilder
        .overrideGuard(ApiTokenGuard)
        .useClass(MockApiTokenGuard);
      return await Promise.resolve();
    });
    return this;
  }

  /**
   * Generate a few users, identities and auth tokens for testing
   */
  public withUsers() {
    this.setupPostCompile.push(async () => {
      // Create users
      this.testSetup.users.push(
        await this.testSetup.userService.createUser(
          username1,
          'Test User 1',
          null,
          null,
        ),
      );
      this.testSetup.users.push(
        await this.testSetup.userService.createUser(
          username2,
          'Test User 2',
          null,
          null,
        ),
      );
      this.testSetup.users.push(
        await this.testSetup.userService.createUser(
          username3,
          'Test User 3',
          null,
          null,
        ),
      );

      // Create identities for login
      await this.testSetup.localIdentityService.createLocalIdentity(
        this.testSetup.users[0],
        password1,
      );
      await this.testSetup.localIdentityService.createLocalIdentity(
        this.testSetup.users[1],
        password2,
      );
      await this.testSetup.localIdentityService.createLocalIdentity(
        this.testSetup.users[2],
        password3,
      );

      // create auth tokens
      this.testSetup.authTokens = await Promise.all(
        this.testSetup.users.map(async (user) => {
          const validUntil = new Date();
          validUntil.setTime(validUntil.getTime() + 60 * 60 * 1000);
          return await this.testSetup.publicAuthTokenService.addToken(
            user,
            'test',
            validUntil,
          );
        }),
      );

      // create notes with owner
      this.testSetup.ownedNotes.push(
        await this.testSetup.notesService.createNote(
          'Test Note 1',
          this.testSetup.users[0],
          'testAlias1',
        ),
      );
      this.testSetup.ownedNotes.push(
        await this.testSetup.notesService.createNote(
          'Test Note 2',
          this.testSetup.users[1],
          'testAlias2',
        ),
      );
      this.testSetup.ownedNotes.push(
        await this.testSetup.notesService.createNote(
          'Test Note 3',
          this.testSetup.users[2],
          'testAlias3',
        ),
      );
    });
    return this;
  }

  /**
   * Generate a few anonymousNotes for testing
   */
  public withNotes(): TestSetupBuilder {
    this.setupPostCompile.push(async () => {
      this.testSetup.anonymousNotes.push(
        await this.testSetup.notesService.createNote(
          'Anonymous Note 1',
          null,
          'anonAlias1',
        ),
      );
      this.testSetup.anonymousNotes.push(
        await this.testSetup.notesService.createNote(
          'Anonymous Note 2',
          null,
          'anonAlias2',
        ),
      );
      this.testSetup.anonymousNotes.push(
        await this.testSetup.notesService.createNote(
          'Anonymous Note 3',
          null,
          'anonAlias3',
        ),
      );
    });
    return this;
  }
}

export const username1 = 'testuser1';
export const password1 = 'AStrongP@sswordForUser1';
export const username2 = 'testuser2';
export const password2 = 'AStrongP@sswordForUser2';
export const username3 = 'testuser3';
export const password3 = 'AStrongP@sswordForUser3';
