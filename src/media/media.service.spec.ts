/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import appConfigMock from '../config/app.config.mock';
import { LoggerModule } from '../logger/logger.module';
import { AuthorColor } from '../notes/author-color.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { Authorship } from '../revisions/authorship.entity';
import { Revision } from '../revisions/revision.entity';
import { AuthToken } from '../users/auth-token.entity';
import { Identity } from '../users/identity.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { FilesystemBackend } from './backends/filesystem-backend';
import { MediaUpload } from './media-upload.entity';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(MediaUpload),
          useValue: {},
        },
        FilesystemBackend,
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock],
        }),
        LoggerModule,
        NotesModule,
        UsersModule,
      ],
    })
      .overrideProvider(getRepositoryToken(AuthorColor))
      .useValue({})
      .overrideProvider(getRepositoryToken(MediaUpload))
      .useValue({})
      .overrideProvider(getRepositoryToken(Authorship))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
