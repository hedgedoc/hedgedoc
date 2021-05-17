/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { LoggerModule } from '../../../logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import mediaConfigMock from '../../../config/mock/media.config.mock';
import appConfigMock from '../../../config/mock/app.config.mock';
import authConfigMock from '../../../config/mock/auth.config.mock';
import customizationConfigMock from '../../../config/mock/customization.config.mock';
import externalConfigMock from '../../../config/mock/external-services.config.mock';
import { MediaModule } from '../../../media/media.module';
import { NotesModule } from '../../../notes/notes.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authorship } from '../../../revisions/authorship.entity';
import { AuthToken } from '../../../auth/auth-token.entity';
import { Identity } from '../../../users/identity.entity';
import { MediaUpload } from '../../../media/media-upload.entity';
import { Note } from '../../../notes/note.entity';
import { Revision } from '../../../revisions/revision.entity';
import { User } from '../../../users/user.entity';
import { Tag } from '../../../notes/tag.entity';
import { NoteGroupPermission } from '../../../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../../../permissions/note-user-permission.entity';
import { Group } from '../../../groups/group.entity';

describe('MediaController', () => {
  let controller: MediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MediaModule,
        NotesModule,
        LoggerModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            mediaConfigMock,
            authConfigMock,
            customizationConfigMock,
            externalConfigMock,
          ],
        }),
      ],
      controllers: [MediaController],
    })
      .overrideProvider(getRepositoryToken(Authorship))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(MediaUpload))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useValue({})
      .compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
