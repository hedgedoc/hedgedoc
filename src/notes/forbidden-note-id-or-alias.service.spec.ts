/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import appConfigMock from '../config/mock/app.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { ForbiddenIdError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { ForbiddenNoteIdOrAliasService } from './forbidden-note-id-or-alias.service';

describe('ForbiddenNoteIdOrAliasService', () => {
  it('crashes if an id is forbidden', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForbiddenNoteIdOrAliasService],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, noteConfigMock],
        }),
        LoggerModule,
      ],
    }).compile();

    const forbiddenNoteIdOrAliasService: ForbiddenNoteIdOrAliasService =
      module.get<ForbiddenNoteIdOrAliasService>(ForbiddenNoteIdOrAliasService);
    const config = module.get<ConfigService>(ConfigService);
    const forbiddenNoteId = config.get('noteConfig').forbiddenNoteIds[0];

    expect(() =>
      forbiddenNoteIdOrAliasService.isForbiddenNoteIdOrAlias(forbiddenNoteId),
    ).toThrow(ForbiddenIdError);
  });
});
