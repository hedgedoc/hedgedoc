/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TokensController } from './tokens.controller';
import { LoggerModule } from '../../../logger/logger.module';
import { UsersModule } from '../../../users/users.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Identity } from '../../../users/identity.entity';
import { User } from '../../../users/user.entity';
import { AuthToken } from '../../../users/auth-token.entity';

describe('TokensController', () => {
  let controller: TokensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      imports: [LoggerModule, UsersModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .compile();

    controller = module.get<TokensController>(TokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
