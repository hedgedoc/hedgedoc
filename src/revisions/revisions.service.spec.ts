/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthToken } from '../auth/auth-token.entity';
import { Author } from '../authors/author.entity';
import appConfigMock from '../config/mock/app.config.mock';
import { NotInDBError } from '../errors/errors';
import { Group } from '../groups/group.entity';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';
import { Edit } from './edit.entity';
import { Revision } from './revision.entity';
import { RevisionsService } from './revisions.service';

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
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
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

  describe('purgeRevisions', () => {
    it('purges the revision history', async () => {
      const note = {} as Note;
      note.id = 'test';
      let revisions: Revision[] = [];
      const revision1 = Revision.create('a', 'a');
      revision1.id = 1;
      const revision2 = Revision.create('b', 'b');
      revision2.id = 2;
      const revision3 = Revision.create('c', 'c');
      revision3.id = 3;
      revisions.push(revision1, revision2, revision3);
      note.revisions = Promise.resolve(revisions);
      jest.spyOn(revisionRepo, 'find').mockResolvedValueOnce(revisions);
      jest.spyOn(service, 'getLatestRevision').mockResolvedValueOnce(revision3);
      revisionRepo.remove = jest
        .fn()
        .mockImplementation((deleteList: Revision[]) => {
          revisions = revisions.filter(
            (item: Revision) => !deleteList.includes(item),
          );
          return Promise.resolve(deleteList);
        });

      // expected to return all the purged revisions
      expect(await service.purgeRevisions(note)).toHaveLength(2);

      // expected to have only the latest revision
      const updatedRevisions: Revision[] = [revision3];
      expect(revisions).toEqual(updatedRevisions);
    });
    it('has no effect on revision history when a single revision is present', async () => {
      const note = {} as Note;
      note.id = 'test';
      let revisions: Revision[] = [];
      const revision1 = Revision.create('a', 'a');
      revision1.id = 1;
      revisions.push(revision1);
      note.revisions = Promise.resolve(revisions);
      jest.spyOn(revisionRepo, 'find').mockResolvedValueOnce(revisions);
      jest.spyOn(service, 'getLatestRevision').mockResolvedValueOnce(revision1);
      revisionRepo.remove = jest
        .fn()
        .mockImplementation((deleteList: Revision[]) => {
          revisions = revisions.filter(
            (item: Revision) => !deleteList.includes(item),
          );
          return Promise.resolve(deleteList);
        });

      // expected to return all the purged revisions
      expect(await service.purgeRevisions(note)).toHaveLength(0);

      // expected to have only the latest revision
      const updatedRevisions: Revision[] = [revision1];
      expect(revisions).toEqual(updatedRevisions);
    });
  });
});
