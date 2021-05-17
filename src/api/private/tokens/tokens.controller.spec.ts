/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Session } from '../../../users/session.entity';
import { TokensController } from './tokens.controller';
import { LoggerModule } from '../../../logger/logger.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Identity } from '../../../users/identity.entity';
import { User } from '../../../users/user.entity';
import { AuthToken } from '../../../auth/auth-token.entity';
import { AuthModule } from '../../../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import appConfigMock from '../../../config/mock/app.config.mock';

describe('TokensController', () => {
  let controller: TokensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock],
        }),
        LoggerModule,
        AuthModule,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .compile();

    controller = module.get<TokensController>(TokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
