/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { AuthToken } from '../auth/auth-token.entity';
import { Identity } from '../users/identity.entity';
import { User } from '../users/user.entity';
import { Authorship } from './authorship.entity';
import { Revision } from './revision.entity';
import { RevisionsService } from './revisions.service';
import { Tag } from '../notes/tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Group } from '../groups/group.entity';
import { ConfigModule } from '@nestjs/config';
import appConfigMock from '../config/mock/app.config.mock';

describe('RevisionsService', () => {
  let service: RevisionsService;
  let revisionRepo: Repository<Revision>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevisionsService,
        {
          provide: getRepositoryToken(Revision),
          useClass: Repository,
        },
      ],
      imports: [
        NotesModule,
        LoggerModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock],
        }),
      ],
    })
      .overrideProvider(getRepositoryToken(Authorship))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useValue({})
      .compile();

    service = module.get<RevisionsService>(RevisionsService);
    revisionRepo = module.get<Repository<Revision>>(
      getRepositoryToken(Revision),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRevision', () => {
    it('returns a revision', async () => {
      const revision = Revision.create('', '');
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(revision);
      expect(await service.getRevision({} as Note, 1)).toEqual(revision);
    });
    it('throws if the revision is not in the databse', async () => {
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(undefined);
      await expect(service.getRevision({} as Note, 1)).rejects.toThrow(
        NotInDBError,
      );
    });
  });
});
