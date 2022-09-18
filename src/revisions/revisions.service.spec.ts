/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mock } from 'ts-mockery';
import { Repository } from 'typeorm';

import { AuthToken } from '../auth/auth-token.entity';
import { Author } from '../authors/author.entity';
import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { NotInDBError } from '../errors/errors';
import { Group } from '../groups/group.entity';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Alias } from '../notes/alias.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';
import { Edit } from './edit.entity';
import { EditService } from './edit.service';
import { Revision } from './revision.entity';
import { RevisionsService } from './revisions.service';

describe('RevisionsService', () => {
  let service: RevisionsService;
  let revisionRepo: Repository<Revision>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevisionsService,
        EditService,
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
          load: [
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            noteConfigMock,
          ],
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
      .overrideProvider(getRepositoryToken(Alias))
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
      const note = Mock.of<Note>({});
      const revision = Revision.create('', '', note) as Revision;
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(revision);
      expect(await service.getRevision({} as Note, 1)).toEqual(revision);
    });
    it('throws if the revision is not in the databse', async () => {
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.getRevision({} as Note, 1)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('purgeRevisions', () => {
    it('purges the revision history', async () => {
      const note = {} as Note;
      note.id = 4711;
      let revisions: Revision[] = [];
      const revision1 = Revision.create('a', 'a', note) as Revision;
      revision1.id = 1;
      const revision2 = Revision.create('b', 'b', note) as Revision;
      revision2.id = 2;
      const revision3 = Revision.create('c', 'c', note) as Revision;
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
      note.id = 4711;
      let revisions: Revision[] = [];
      const revision1 = Revision.create('a', 'a', note) as Revision;
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

  describe('getRevisionUserInfo', () => {
    it('counts users correctly', async () => {
      const user = User.create('test', 'test') as User;
      const author = Author.create(123) as Author;
      author.user = Promise.resolve(user);
      const anonAuthor = Author.create(123) as Author;
      const anonAuthor2 = Author.create(123) as Author;
      const edits = [Edit.create(author, 12, 15) as Edit];
      edits.push(Edit.create(author, 16, 18) as Edit);
      edits.push(Edit.create(author, 29, 20) as Edit);
      edits.push(Edit.create(anonAuthor, 29, 20) as Edit);
      edits.push(Edit.create(anonAuthor, 29, 20) as Edit);
      edits.push(Edit.create(anonAuthor2, 29, 20) as Edit);
      const revision = Revision.create('', '', {} as Note) as Revision;
      revision.edits = Promise.resolve(edits);

      const userInfo = await service.getRevisionUserInfo(revision);
      expect(userInfo.usernames.length).toEqual(1);
      expect(userInfo.anonymousUserCount).toEqual(2);
    });
  });

  describe('createRevision', () => {
    it('creates a new revision', async () => {
      const note = Mock.of<Note>({});
      const oldContent = 'old content\n';
      const newContent = 'new content\n';

      const oldRevision = Mock.of<Revision>({ content: oldContent });
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(oldRevision);
      jest
        .spyOn(revisionRepo, 'save')
        .mockImplementation((revision) =>
          Promise.resolve(revision as Revision),
        );

      const createdRevision = await service.createRevision(note, newContent);
      expect(createdRevision).not.toBeUndefined();
      expect(createdRevision?.content).toBe(newContent);
      await expect(createdRevision?.note).resolves.toBe(note);
      expect(createdRevision?.patch).toMatchInlineSnapshot(`
        "Index: markdownContent
        ===================================================================
        --- markdownContent
        +++ markdownContent
        @@ -1,1 +1,1 @@
        -old content
        +new content
        "
      `);
    });

    it("won't create a revision if content is unchanged", async () => {
      const note = Mock.of<Note>({});
      const oldContent = 'old content\n';

      const oldRevision = Mock.of<Revision>({ content: oldContent });
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(oldRevision);
      const saveSpy = jest.spyOn(revisionRepo, 'save').mockImplementation();

      const createdRevision = await service.createRevision(note, oldContent);
      expect(createdRevision).toBeUndefined();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });
});
