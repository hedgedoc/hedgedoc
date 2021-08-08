/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getConnectionToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';

import { AuthToken } from '../../../../auth/auth-token.entity';
import { Author } from '../../../../authors/author.entity';
import appConfigMock from '../../../../config/mock/app.config.mock';
import { Group } from '../../../../groups/group.entity';
import { HistoryEntry } from '../../../../history/history-entry.entity';
import { HistoryModule } from '../../../../history/history.module';
import { Identity } from '../../../../identity/identity.entity';
import { LoggerModule } from '../../../../logger/logger.module';
import { Note } from '../../../../notes/note.entity';
import { NotesModule } from '../../../../notes/notes.module';
import { Tag } from '../../../../notes/tag.entity';
import { NoteGroupPermission } from '../../../../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../../../../permissions/note-user-permission.entity';
import { Edit } from '../../../../revisions/edit.entity';
import { Revision } from '../../../../revisions/revision.entity';
import { Session } from '../../../../users/session.entity';
import { User } from '../../../../users/user.entity';
import { UsersModule } from '../../../../users/users.module';
import { HistoryController } from './history.controller';

describe('HistoryController', () => {
  let controller: HistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoryController],
      imports: [
        UsersModule,
        HistoryModule,
        NotesModule,
        LoggerModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock],
        }),
        TypeOrmModule.forRoot(),
      ],
    })
      .overrideProvider(getConnectionToken())
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(HistoryEntry))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .compile();

    controller = module.get<HistoryController>(HistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
