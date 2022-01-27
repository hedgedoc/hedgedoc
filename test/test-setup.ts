/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule, Routes } from 'nest-router';

import { PrivateApiModule } from '../src/api/private/private-api.module';
import { PublicApiModule } from '../src/api/public/public-api.module';
import { AuthTokenWithSecretDto } from '../src/auth/auth-token-with-secret.dto';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { MockAuthGuard } from '../src/auth/mock-auth.guard';
import { TokenAuthGuard } from '../src/auth/token.strategy';
import { AuthorsModule } from '../src/authors/authors.module';
import { AuthConfig } from '../src/config/auth.config';
import appConfigMock from '../src/config/mock/app.config.mock';
import authConfigMock from '../src/config/mock/auth.config.mock';
import customizationConfigMock from '../src/config/mock/customization.config.mock';
import externalServicesConfigMock from '../src/config/mock/external-services.config.mock';
import mediaConfigMock from '../src/config/mock/media.config.mock';
import { FrontendConfigModule } from '../src/frontend-config/frontend-config.module';
import { GroupsModule } from '../src/groups/groups.module';
import { HistoryModule } from '../src/history/history.module';
import { HistoryService } from '../src/history/history.service';
import { IdentityModule } from '../src/identity/identity.module';
import { IdentityService } from '../src/identity/identity.service';
import { LoggerModule } from '../src/logger/logger.module';
import { MediaModule } from '../src/media/media.module';
import { MediaService } from '../src/media/media.service';
import { MonitoringModule } from '../src/monitoring/monitoring.module';
import { AliasService } from '../src/notes/alias.service';
import { Note } from '../src/notes/note.entity';
import { NotesModule } from '../src/notes/notes.module';
import { NotesService } from '../src/notes/notes.service';
import { PermissionsModule } from '../src/permissions/permissions.module';
import { RevisionsModule } from '../src/revisions/revisions.module';
import { User } from '../src/users/user.entity';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';
import { setupSessionMiddleware } from '../src/utils/session';

export class TestSetup {
  moduleRef: TestingModule;
  app: NestExpressApplication;

  userService: UsersService;
  configService: ConfigService;
  identityService: IdentityService;
  notesService: NotesService;
  mediaService: MediaService;
  historyService: HistoryService;
  aliasService: AliasService;
  authService: AuthService;

  users: User[] = [];
  authTokens: AuthTokenWithSecretDto[] = [];
  anonymousNotes: Note[] = [];
  ownedNotes: Note[] = [];
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

  /**
   * Creates a new instance of TestSetupBuilder
   */
  public static create(): TestSetupBuilder {
    const testSetupBuilder = new TestSetupBuilder();
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
    testSetupBuilder.testingModuleBuilder = Test.createTestingModule({
      imports: [
        RouterModule.forRoutes(routes),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
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
        AuthModule,
        FrontendConfigModule,
        IdentityModule,
      ],
    });
    return testSetupBuilder;
  }

  /**
   * Builds the final TestSetup from the configured builder
   */
  public async build(): Promise<TestSetup> {
    for (const setupFunction of this.setupPreCompile) {
      await setupFunction();
    }

    this.testSetup.moduleRef = await this.testingModuleBuilder.compile();

    this.testSetup.userService =
      this.testSetup.moduleRef.get<UsersService>(UsersService);
    this.testSetup.configService =
      this.testSetup.moduleRef.get<ConfigService>(ConfigService);
    this.testSetup.identityService =
      this.testSetup.moduleRef.get<IdentityService>(IdentityService);
    this.testSetup.notesService =
      this.testSetup.moduleRef.get<NotesService>(NotesService);
    this.testSetup.mediaService =
      this.testSetup.moduleRef.get<MediaService>(MediaService);
    this.testSetup.historyService =
      this.testSetup.moduleRef.get<HistoryService>(HistoryService);
    this.testSetup.aliasService =
      this.testSetup.moduleRef.get<AliasService>(AliasService);
    this.testSetup.authService =
      this.testSetup.moduleRef.get<AuthService>(AuthService);

    this.testSetup.app = this.testSetup.moduleRef.createNestApplication();

    setupSessionMiddleware(
      this.testSetup.app,
      this.testSetup.configService.get<AuthConfig>('authConfig'),
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
        .overrideGuard(TokenAuthGuard)
        .useClass(MockAuthGuard);
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
        await this.testSetup.userService.createUser('testuser1', 'Test User 1'),
      );
      this.testSetup.users.push(
        await this.testSetup.userService.createUser('testuser2', 'Test User 2'),
      );
      this.testSetup.users.push(
        await this.testSetup.userService.createUser('testuser3', 'Test User 3'),
      );

      // Create identities for login
      await this.testSetup.identityService.createLocalIdentity(
        this.testSetup.users[0],
        'testuser1',
      );
      await this.testSetup.identityService.createLocalIdentity(
        this.testSetup.users[1],
        'testuser2',
      );
      await this.testSetup.identityService.createLocalIdentity(
        this.testSetup.users[2],
        'testuser3',
      );

      // create auth tokens
      this.testSetup.authTokens = await Promise.all(
        this.testSetup.users.map(async (user) => {
          return await this.testSetup.authService.createTokenForUser(
            user,
            'test',
            new Date().getTime() + 60 * 60 * 1000,
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
