/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Author } from '../../../authors/author.entity';
import appConfigMock from '../../../config/mock/app.config.mock';
import authConfigMock from '../../../config/mock/auth.config.mock';
import customizationConfigMock from '../../../config/mock/customization.config.mock';
import externalServicesConfigMock from '../../../config/mock/external-services.config.mock';
import mediaConfigMock from '../../../config/mock/media.config.mock';
import { Group } from '../../../groups/group.entity';
import { Identity } from '../../../identity/identity.entity';
import { LoggerModule } from '../../../logger/logger.module';
import { MediaUpload } from '../../../media/media-upload.entity';
import { MediaModule } from '../../../media/media.module';
import { Note } from '../../../notes/note.entity';
import { Tag } from '../../../notes/tag.entity';
import { NoteGroupPermission } from '../../../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../../../permissions/note-user-permission.entity';
import { Edit } from '../../../revisions/edit.entity';
import { Revision } from '../../../revisions/revision.entity';
import { Session } from '../../../users/session.entity';
import { User } from '../../../users/user.entity';
import { UsersModule } from '../../../users/users.module';
import { MeController } from './me.controller';

describe('MeController', () => {
  let controller: MeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeController],
      imports: [
        UsersModule,
        LoggerModule,
        MediaModule,
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
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(MediaUpload))
      .useValue({})
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .compile();

    controller = module.get<MeController>(MeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
