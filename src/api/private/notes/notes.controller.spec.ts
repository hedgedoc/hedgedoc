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

import { AuthToken } from '../../../auth/auth-token.entity';
import { Author } from '../../../authors/author.entity';
import appConfigMock from '../../../config/mock/app.config.mock';
import mediaConfigMock from '../../../config/mock/media.config.mock';
import { Group } from '../../../groups/group.entity';
import { GroupsModule } from '../../../groups/groups.module';
import { HistoryEntry } from '../../../history/history-entry.entity';
import { HistoryModule } from '../../../history/history.module';
import { Identity } from '../../../identity/identity.entity';
import { LoggerModule } from '../../../logger/logger.module';
import { MediaUpload } from '../../../media/media-upload.entity';
import { MediaModule } from '../../../media/media.module';
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';
import { Tag } from '../../../notes/tag.entity';
import { NoteGroupPermission } from '../../../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../../../permissions/note-user-permission.entity';
import { PermissionsModule } from '../../../permissions/permissions.module';
import { Edit } from '../../../revisions/edit.entity';
import { Revision } from '../../../revisions/revision.entity';
import { RevisionsModule } from '../../../revisions/revisions.module';
import { Session } from '../../../users/session.entity';
import { User } from '../../../users/user.entity';
import { UsersModule } from '../../../users/users.module';
import { NotesController } from './notes.controller';

describe('NotesController', () => {
  let controller: NotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        NotesService,
        {
          provide: getRepositoryToken(Note),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
      imports: [
        RevisionsModule,
        UsersModule,
        GroupsModule,
        LoggerModule,
        PermissionsModule,
        HistoryModule,
        MediaModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, mediaConfigMock],
        }),
        TypeOrmModule.forRoot(),
      ],
    })
      .overrideProvider(getConnectionToken())
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
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
      .overrideProvider(getRepositoryToken(MediaUpload))
      .useValue({})
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
