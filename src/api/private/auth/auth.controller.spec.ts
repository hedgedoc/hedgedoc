/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfigMock from '../../../config/mock/app.config.mock';
import authConfigMock from '../../../config/mock/auth.config.mock';
import { Identity } from '../../../identity/identity.entity';
import { IdentityModule } from '../../../identity/identity.module';
import { LoggerModule } from '../../../logger/logger.module';
import { Session } from '../../../users/session.entity';
import { User } from '../../../users/user.entity';
import { UsersModule } from '../../../users/users.module';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  type MockConnection = {
    transaction: () => void;
  };

  function mockConnection(): MockConnection {
    return {
      transaction: jest.fn(),
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Identity),
          useClass: Repository,
        },
        {
          provide: getConnectionToken(),
          useFactory: mockConnection,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, authConfigMock],
        }),
        LoggerModule,
        UsersModule,
        IdentityModule,
      ],
      controllers: [AuthController],
    })
      .overrideProvider(getRepositoryToken(Identity))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
