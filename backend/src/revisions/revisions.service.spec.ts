/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { eventModuleConfig } from '../events';
import { Group } from '../groups/group.entity';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Alias } from '../notes/alias.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Session } from '../sessions/session.entity';
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
        EventEmitterModule.forRoot(eventModuleConfig),
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
      const revision = Mock.of<Revision>({});
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(revision);
      expect(await service.getRevision(note, 1)).toBe(revision);
    });
    it('throws if the revision is not in the databse', async () => {
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.getRevision({} as Note, 1)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('purgeRevisions', () => {
    let revisions: Revision[];
    let note: Note;

    beforeEach(() => {
      note = Mock.of<Note>({ publicId: 'test-note', id: 1 });
      revisions = [];

      jest
        .spyOn(revisionRepo, 'remove')
        .mockImplementation(
          <T extends Revision | Revision[]>(deleteEntities: T): Promise<T> => {
            const newRevisions = revisions.filter((item: Revision) =>
              Array.isArray(deleteEntities)
                ? !deleteEntities.includes(item)
                : deleteEntities !== item,
            );
            revisions = newRevisions;
            note.revisions = Promise.resolve(newRevisions);
            return Promise.resolve(deleteEntities);
          },
        );
    });

    it('purges the revision history', async () => {
      const revision1 = Mock.of<Revision>({
        id: 1,
        note: Promise.resolve(note),
      });
      const revision2 = Mock.of<Revision>({
        id: 2,
        note: Promise.resolve(note),
      });
      const revision3 = Mock.of<Revision>({
        id: 3,
        note: Promise.resolve(note),
        content:
          '---\ntitle: new title\ndescription: new description\ntags: [ "tag1" ]\n---\nnew content\n',
      });
      revisions = [revision1, revision2, revision3];
      note.revisions = Promise.resolve(revisions);

      jest.spyOn(revisionRepo, 'find').mockResolvedValueOnce(revisions);
      jest.spyOn(service, 'getLatestRevision').mockResolvedValueOnce(revision3);

      jest.spyOn(revisionRepo, 'save').mockResolvedValue(Mock.of<Revision>());

      // expected to return all the purged revisions
      expect(await service.purgeRevisions(note)).toStrictEqual([
        revision1,
        revision2,
      ]);

      expect(revisions).toStrictEqual([revision3]);
      expect(revision3.patch).toMatchSnapshot();
    });
    it('has no effect on revision history when a single revision is present', async () => {
      const revision1 = Mock.of<Revision>({ id: 1 });
      revisions = [revision1];
      note.revisions = Promise.resolve(revisions);

      jest.spyOn(revisionRepo, 'find').mockResolvedValueOnce(revisions);
      jest.spyOn(service, 'getLatestRevision').mockResolvedValueOnce(revision1);

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
      const revision = Mock.of<Revision>({});
      revision.edits = Promise.resolve(edits);

      const userInfo = await service.getRevisionUserInfo(revision);
      expect(userInfo.usernames.length).toEqual(1);
      expect(userInfo.anonymousUserCount).toEqual(2);
    });
  });

  describe('toRevisionMetadataDto', () => {
    it('converts a revision', async () => {
      const revision = Mock.of<Revision>({
        id: 3246,
        content: 'mockContent',
        length: 1854,
        createdAt: new Date('2020-05-20T09:58:00.000Z'),
        title: 'mockTitle',
        tags: Promise.resolve([Mock.of<Tag>({ name: 'mockTag' })]),
        description: 'mockDescription',
        patch: 'mockPatch',
        edits: Promise.resolve([
          Mock.of<Edit>({
            endPos: 93,
            startPos: 34,
            createdAt: new Date('2020-03-04T20:12:00.000Z'),
            updatedAt: new Date('2021-12-10T09:45:00.000Z'),
            author: Promise.resolve(
              Mock.of<Author>({
                user: Promise.resolve(
                  Mock.of<User>({
                    username: 'mockusername',
                  }),
                ),
              }),
            ),
          }),
        ]),
      });
      expect(await service.toRevisionMetadataDto(revision))
        .toMatchInlineSnapshot(`
        {
          "anonymousAuthorCount": 0,
          "authorUsernames": [
            "mockusername",
          ],
          "createdAt": 2020-05-20T09:58:00.000Z,
          "description": "mockDescription",
          "id": 3246,
          "length": 1854,
          "tags": [
            "mockTag",
          ],
          "title": "mockTitle",
        }
      `);
    });
  });

  describe('toRevisionDto', () => {
    it('converts a revision', async () => {
      const revision = Mock.of<Revision>({
        id: 3246,
        content: 'mockContent',
        length: 1854,
        createdAt: new Date('2020-05-20T09:58:00.000Z'),
        title: 'mockTitle',
        tags: Promise.resolve([Mock.of<Tag>({ name: 'mockTag' })]),
        description: 'mockDescription',
        patch: 'mockPatch',
        edits: Promise.resolve([
          Mock.of<Edit>({
            endPos: 93,
            startPos: 34,
            createdAt: new Date('2020-03-04T22:32:00.000Z'),
            updatedAt: new Date('2021-02-10T12:23:00.000Z'),
            author: Promise.resolve(
              Mock.of<Author>({
                user: Promise.resolve(
                  Mock.of<User>({
                    username: 'mockusername',
                  }),
                ),
              }),
            ),
          }),
        ]),
      });
      expect(await service.toRevisionDto(revision)).toMatchInlineSnapshot(`
        {
          "anonymousAuthorCount": 0,
          "authorUsernames": [
            "mockusername",
          ],
          "content": "mockContent",
          "createdAt": 2020-05-20T09:58:00.000Z,
          "description": "mockDescription",
          "edits": [
            {
              "createdAt": 2020-03-04T22:32:00.000Z,
              "endPos": 93,
              "startPos": 34,
              "updatedAt": 2021-02-10T12:23:00.000Z,
              "username": "mockusername",
            },
          ],
          "id": 3246,
          "length": 1854,
          "patch": "mockPatch",
          "tags": [
            "mockTag",
          ],
          "title": "mockTitle",
        }
      `);
    });
  });

  describe('createRevision', () => {
    it('creates a new revision', async () => {
      const note = Mock.of<Note>({ publicId: 'test-note', id: 1 });
      const oldContent = 'old content\n';
      const newContent =
        '---\ntitle: new title\ndescription: new description\ntags: [ "tag1" ]\n---\nnew content\n';

      const oldRevision = Mock.of<Revision>({ content: oldContent, id: 1 });
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(oldRevision);
      jest
        .spyOn(revisionRepo, 'save')
        .mockImplementation((revision) =>
          Promise.resolve(revision as Revision),
        );

      const createdRevision = await service.createRevision(note, newContent);
      expect(createdRevision).not.toBeUndefined();
      expect(createdRevision?.content).toBe(newContent);
      await expect(createdRevision?.tags).resolves.toMatchInlineSnapshot(`
        [
          Tag {
            "name": "tag1",
          },
        ]
      `);
      expect(createdRevision?.title).toBe('new title');
      expect(createdRevision?.description).toBe('new description');
      await expect(createdRevision?.note).resolves.toBe(note);
      expect(createdRevision?.patch).toMatchInlineSnapshot(`
        "Index: test-note
        ===================================================================
        --- test-note
        +++ test-note
        @@ -1,1 +1,6 @@
        -old content
        +---
        +title: new title
        +description: new description
        +tags: [ "tag1" ]
        +---
        +new content
        "
      `);
    });

    it("won't create a revision if content is unchanged", async () => {
      const note = Mock.of<Note>({ id: 1 });
      const oldContent = 'old content\n';

      const oldRevision = Mock.of<Revision>({ content: oldContent, id: 1 });
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(oldRevision);
      const saveSpy = jest.spyOn(revisionRepo, 'save').mockImplementation();

      const createdRevision = await service.createRevision(note, oldContent);
      expect(createdRevision).toBeUndefined();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('createAndSaveRevision', () => {
    it('creates and saves a new revision', async () => {
      const newRevision = Mock.of<Revision>();
      const createRevisionSpy = jest
        .spyOn(service, 'createRevision')
        .mockResolvedValue(newRevision);
      const repoSaveSpy = jest
        .spyOn(revisionRepo, 'save')
        .mockResolvedValue(newRevision);

      const note = Mock.of<Note>({});
      const newContent = 'MockContent';

      const yjsState = [0, 1, 2, 3, 4, 5];

      await service.createAndSaveRevision(note, newContent, yjsState);
      expect(createRevisionSpy).toHaveBeenCalledWith(
        note,
        newContent,
        yjsState,
      );
      expect(repoSaveSpy).toHaveBeenCalledWith(newRevision);
    });

    it("doesn't save if no revision has been created", async () => {
      const createRevisionSpy = jest
        .spyOn(service, 'createRevision')
        .mockResolvedValue(undefined);
      const repoSaveSpy = jest
        .spyOn(revisionRepo, 'save')
        .mockRejectedValue(new Error("shouldn't have been called"));

      const note = Mock.of<Note>({});
      const newContent = 'MockContent';
      const yjsState = [0, 1, 2, 3, 4, 5];

      await service.createAndSaveRevision(note, newContent, yjsState);
      expect(createRevisionSpy).toHaveBeenCalledWith(
        note,
        newContent,
        yjsState,
      );
      expect(repoSaveSpy).not.toHaveBeenCalled();
    });
  });
});
