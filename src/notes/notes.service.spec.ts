/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthToken } from '../auth/auth-token.entity';
import { Author } from '../authors/author.entity';
import appConfigMock from '../config/mock/app.config.mock';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
  PermissionsUpdateInconsistentError,
} from '../errors/errors';
import { Group } from '../groups/group.entity';
import { GroupsModule } from '../groups/groups.module';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { RevisionsModule } from '../revisions/revisions.module';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { Alias } from './alias.entity';
import {
  NoteGroupPermissionUpdateDto,
  NoteUserPermissionUpdateDto,
} from './note-permissions.dto';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { Tag } from './tag.entity';

describe('NotesService', () => {
  let service: NotesService;
  let noteRepo: Repository<Note>;
  let revisionRepo: Repository<Revision>;
  let userRepo: Repository<User>;
  let groupRepo: Repository<Group>;
  let forbiddenNoteId: string;

  beforeEach(async () => {
    /**
     * We need to have *one* userRepo for both the providers array and
     * the overrideProvider call, as otherwise we have two instances
     * and the mock of createQueryBuilder replaces the wrong one
     * **/
    userRepo = new Repository<User>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getRepositoryToken(Note),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Tag),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Alias),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock],
        }),
        LoggerModule,
        UsersModule,
        GroupsModule,
        RevisionsModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Note))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Tag))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Alias))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepo)
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .compile();

    const config = module.get<ConfigService>(ConfigService);
    forbiddenNoteId = config.get('appConfig').forbiddenNoteIds[0];
    service = module.get<NotesService>(NotesService);
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
    revisionRepo = module.get<Repository<Revision>>(
      getRepositoryToken(Revision),
    );
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    groupRepo = module.get<Repository<Group>>(getRepositoryToken(Group));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserNotes', () => {
    describe('works', () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const alias = 'alias';
      const note = Note.create(user, alias) as Note;

      it('with no note', async () => {
        jest.spyOn(noteRepo, 'find').mockResolvedValueOnce(undefined);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([]);
      });

      it('with one note', async () => {
        jest.spyOn(noteRepo, 'find').mockResolvedValueOnce([note]);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([note]);
      });

      it('with multiple note', async () => {
        jest.spyOn(noteRepo, 'find').mockResolvedValueOnce([note, note]);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([note, note]);
      });
    });
  });

  describe('createNote', () => {
    const user = User.create('hardcoded', 'Testy') as User;
    const alias = 'alias';
    const content = 'testContent';
    describe('works', () => {
      beforeEach(() => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementation(async (note: Note): Promise<Note> => note);
      });
      it('without alias, without owner', async () => {
        const newNote = await service.createNote(content, null);
        const revisions = await newNote.revisions;
        expect(revisions).toHaveLength(1);
        expect(revisions[0].content).toEqual(content);
        expect(newNote.historyEntries).toHaveLength(0);
        expect(newNote.userPermissions).toHaveLength(0);
        expect(newNote.groupPermissions).toHaveLength(0);
        expect(newNote.tags).toHaveLength(0);
        expect(newNote.owner).toBeNull();
        expect(newNote.aliases).toHaveLength(0);
      });
      it('without alias, with owner', async () => {
        const newNote = await service.createNote(content, user);
        const revisions = await newNote.revisions;
        expect(revisions).toHaveLength(1);
        expect(revisions[0].content).toEqual(content);
        expect(newNote.historyEntries).toHaveLength(1);
        expect(newNote.historyEntries[0].user).toEqual(user);
        expect(newNote.userPermissions).toHaveLength(0);
        expect(newNote.groupPermissions).toHaveLength(0);
        expect(newNote.tags).toHaveLength(0);
        expect(newNote.owner).toEqual(user);
        expect(newNote.aliases).toHaveLength(0);
      });
      it('with alias, without owner', async () => {
        const newNote = await service.createNote(content, null, alias);
        const revisions = await newNote.revisions;
        expect(revisions).toHaveLength(1);
        expect(revisions[0].content).toEqual(content);
        expect(newNote.historyEntries).toHaveLength(0);
        expect(newNote.userPermissions).toHaveLength(0);
        expect(newNote.groupPermissions).toHaveLength(0);
        expect(newNote.tags).toHaveLength(0);
        expect(newNote.owner).toBeNull();
        expect(newNote.aliases).toHaveLength(1);
      });
      it('with alias, with owner', async () => {
        const newNote = await service.createNote(content, user, alias);
        const revisions = await newNote.revisions;
        expect(revisions).toHaveLength(1);
        expect(revisions[0].content).toEqual(content);
        expect(newNote.historyEntries).toHaveLength(1);
        expect(newNote.historyEntries[0].user).toEqual(user);
        expect(newNote.userPermissions).toHaveLength(0);
        expect(newNote.groupPermissions).toHaveLength(0);
        expect(newNote.tags).toHaveLength(0);
        expect(newNote.owner).toEqual(user);
        expect(newNote.aliases).toHaveLength(1);
        expect(newNote.aliases[0].name).toEqual(alias);
      });
    });
    describe('fails:', () => {
      it('alias is forbidden', async () => {
        await expect(
          service.createNote(content, null, forbiddenNoteId),
        ).rejects.toThrow(ForbiddenIdError);
      });

      it('alias is already used', async () => {
        jest.spyOn(noteRepo, 'save').mockImplementationOnce(async () => {
          throw new Error();
        });
        await expect(service.createNote(content, null, alias)).rejects.toThrow(
          AlreadyInDBError,
        );
      });
    });
  });

  describe('getNoteContent', () => {
    it('works', async () => {
      const content = 'testContent';
      jest
        .spyOn(noteRepo, 'save')
        .mockImplementation(async (note: Note): Promise<Note> => note);
      const newNote = await service.createNote(content, null);
      const revisions = await newNote.revisions;
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(revisions[0]);
      await service.getNoteContent(newNote).then((result) => {
        expect(result).toEqual(content);
      });
    });
  });

  describe('getLatestRevision', () => {
    it('works', async () => {
      const content = 'testContent';
      jest
        .spyOn(noteRepo, 'save')
        .mockImplementation(async (note: Note): Promise<Note> => note);
      const newNote = await service.createNote(content, null);
      const revisions = await newNote.revisions;
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(revisions[0]);
      await service.getLatestRevision(newNote).then((result) => {
        expect(result).toEqual(revisions[0]);
      });
    });
  });

  describe('getFirstRevision', () => {
    it('works', async () => {
      const user = {} as User;
      user.username = 'hardcoded';
      const content = 'testContent';
      jest
        .spyOn(noteRepo, 'save')
        .mockImplementation(async (note: Note): Promise<Note> => note);
      const newNote = await service.createNote(content, null);
      const revisions = await newNote.revisions;
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(revisions[0]);
      await service.getLatestRevision(newNote).then((result) => {
        expect(result).toEqual(revisions[0]);
      });
    });
  });

  describe('getNoteByIdOrAlias', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const note = Note.create(user);
      const createQueryBuilder = {
        leftJoinAndSelect: () => createQueryBuilder,
        where: () => createQueryBuilder,
        orWhere: () => createQueryBuilder,
        setParameter: () => createQueryBuilder,
        getOne: () => note,
      };
      jest
        .spyOn(noteRepo, 'createQueryBuilder')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockImplementation(() => createQueryBuilder);
      const foundNote = await service.getNoteByIdOrAlias('noteThatExists');
      expect(foundNote).toEqual(note);
    });
    describe('fails:', () => {
      it('no note found', async () => {
        const createQueryBuilder = {
          leftJoinAndSelect: () => createQueryBuilder,
          where: () => createQueryBuilder,
          orWhere: () => createQueryBuilder,
          setParameter: () => createQueryBuilder,
          getOne: () => undefined,
        };
        jest
          .spyOn(noteRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        await expect(
          service.getNoteByIdOrAlias('noteThatDoesNoteExist'),
        ).rejects.toThrow(NotInDBError);
      });
      it('id is forbidden', async () => {
        await expect(
          service.getNoteByIdOrAlias(forbiddenNoteId),
        ).rejects.toThrow(ForbiddenIdError);
      });
    });
  });

  describe('deleteNote', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const note = Note.create(user) as Note;
      jest
        .spyOn(noteRepo, 'remove')
        .mockImplementationOnce(async (entry, _) => {
          expect(entry).toEqual(note);
          return entry;
        });
      await service.deleteNote(note);
    });
  });

  describe('updateNote', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const note = Note.create(user) as Note;
      const revisionLength = (await note.revisions).length;
      jest
        .spyOn(noteRepo, 'save')
        .mockImplementationOnce(async (entry: Note) => {
          return entry;
        });
      const updatedNote = await service.updateNote(note, 'newContent');
      expect(await updatedNote.revisions).toHaveLength(revisionLength + 1);
    });
  });

  describe('updateNotePermissions', () => {
    const userPermissionUpdate = new NoteUserPermissionUpdateDto();
    userPermissionUpdate.username = 'hardcoded';
    userPermissionUpdate.canEdit = true;
    const groupPermissionUpate = new NoteGroupPermissionUpdateDto();
    groupPermissionUpate.groupname = 'testGroup';
    groupPermissionUpate.canEdit = false;
    const user = User.create(userPermissionUpdate.username, 'Testy') as User;
    const group = Group.create(
      groupPermissionUpate.groupname,
      groupPermissionUpate.groupname,
      false,
    ) as Group;
    const note = Note.create(user) as Note;
    describe('works', () => {
      it('with empty GroupPermissions and with empty UserPermissions', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [],
          sharedToGroups: [],
        });
        expect(savedNote.userPermissions).toHaveLength(0);
        expect(savedNote.groupPermissions).toHaveLength(0);
      });
      it('with empty GroupPermissions and with new UserPermissions', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [userPermissionUpdate],
          sharedToGroups: [],
        });
        expect(savedNote.userPermissions).toHaveLength(1);
        expect(savedNote.userPermissions[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect(savedNote.userPermissions[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(savedNote.groupPermissions).toHaveLength(0);
      });
      it('with empty GroupPermissions and with existing UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.userPermissions = [
          {
            note: noteWithPreexistingPermissions,
            user: user,
            canEdit: !userPermissionUpdate.canEdit,
          },
        ];
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [userPermissionUpdate],
          sharedToGroups: [],
        });
        expect(savedNote.userPermissions).toHaveLength(1);
        expect(savedNote.userPermissions[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect(savedNote.userPermissions[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(savedNote.groupPermissions).toHaveLength(0);
      });
      it('with new GroupPermissions and with empty UserPermissions', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [],
          sharedToGroups: [groupPermissionUpate],
        });
        expect(savedNote.userPermissions).toHaveLength(0);
        expect(savedNote.groupPermissions[0].group.name).toEqual(
          groupPermissionUpate.groupname,
        );
        expect(savedNote.groupPermissions[0].canEdit).toEqual(
          groupPermissionUpate.canEdit,
        );
      });
      it('with new GroupPermissions and with new UserPermissions', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [userPermissionUpdate],
          sharedToGroups: [groupPermissionUpate],
        });
        expect(savedNote.userPermissions[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect(savedNote.userPermissions[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(savedNote.groupPermissions[0].group.name).toEqual(
          groupPermissionUpate.groupname,
        );
        expect(savedNote.groupPermissions[0].canEdit).toEqual(
          groupPermissionUpate.canEdit,
        );
      });
      it('with new GroupPermissions and with existing UserPermissions', async () => {
        const noteWithUserPermission: Note = { ...note };
        noteWithUserPermission.userPermissions = [
          {
            note: noteWithUserPermission,
            user: user,
            canEdit: !userPermissionUpdate.canEdit,
          },
        ];
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(
          noteWithUserPermission,
          {
            sharedToUsers: [userPermissionUpdate],
            sharedToGroups: [groupPermissionUpate],
          },
        );
        expect(savedNote.userPermissions[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect(savedNote.userPermissions[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(savedNote.groupPermissions[0].group.name).toEqual(
          groupPermissionUpate.groupname,
        );
        expect(savedNote.groupPermissions[0].canEdit).toEqual(
          groupPermissionUpate.canEdit,
        );
      });
      it('with existing GroupPermissions and with empty UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = [
          {
            note: noteWithPreexistingPermissions,
            group: group,
            canEdit: !groupPermissionUpate.canEdit,
          },
        ];
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const savedNote = await service.updateNotePermissions(
          noteWithPreexistingPermissions,
          {
            sharedToUsers: [],
            sharedToGroups: [groupPermissionUpate],
          },
        );
        expect(savedNote.userPermissions).toHaveLength(0);
        expect(savedNote.groupPermissions[0].group.name).toEqual(
          groupPermissionUpate.groupname,
        );
        expect(savedNote.groupPermissions[0].canEdit).toEqual(
          groupPermissionUpate.canEdit,
        );
      });
      it('with existing GroupPermissions and with new UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = [
          {
            note: noteWithPreexistingPermissions,
            group: group,
            canEdit: !groupPermissionUpate.canEdit,
          },
        ];
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(
          noteWithPreexistingPermissions,
          {
            sharedToUsers: [userPermissionUpdate],
            sharedToGroups: [groupPermissionUpate],
          },
        );
        expect(savedNote.userPermissions[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect(savedNote.userPermissions[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(savedNote.groupPermissions[0].group.name).toEqual(
          groupPermissionUpate.groupname,
        );
        expect(savedNote.groupPermissions[0].canEdit).toEqual(
          groupPermissionUpate.canEdit,
        );
      });
      it('with existing GroupPermissions and with existing UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = [
          {
            note: noteWithPreexistingPermissions,
            group: group,
            canEdit: !groupPermissionUpate.canEdit,
          },
        ];
        noteWithPreexistingPermissions.userPermissions = [
          {
            note: noteWithPreexistingPermissions,
            user: user,
            canEdit: !userPermissionUpdate.canEdit,
          },
        ];
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(
          noteWithPreexistingPermissions,
          {
            sharedToUsers: [userPermissionUpdate],
            sharedToGroups: [groupPermissionUpate],
          },
        );
        expect(savedNote.userPermissions[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect(savedNote.userPermissions[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(savedNote.groupPermissions[0].group.name).toEqual(
          groupPermissionUpate.groupname,
        );
        expect(savedNote.groupPermissions[0].canEdit).toEqual(
          groupPermissionUpate.canEdit,
        );
      });
    });
    describe('fails:', () => {
      it('userPermissions has duplicate entries', async () => {
        await expect(
          service.updateNotePermissions(note, {
            sharedToUsers: [userPermissionUpdate, userPermissionUpdate],
            sharedToGroups: [],
          }),
        ).rejects.toThrow(PermissionsUpdateInconsistentError);
      });

      it('groupPermissions has duplicate entries', async () => {
        await expect(
          service.updateNotePermissions(note, {
            sharedToUsers: [],
            sharedToGroups: [groupPermissionUpate, groupPermissionUpate],
          }),
        ).rejects.toThrow(PermissionsUpdateInconsistentError);
      });

      it('userPermissions and groupPermissions have duplicate entries', async () => {
        await expect(
          service.updateNotePermissions(note, {
            sharedToUsers: [userPermissionUpdate, userPermissionUpdate],
            sharedToGroups: [groupPermissionUpate, groupPermissionUpate],
          }),
        ).rejects.toThrow(PermissionsUpdateInconsistentError);
      });
    });
  });

  describe('toTagList', () => {
    it('works', async () => {
      const note = {} as Note;
      note.tags = [
        {
          id: 1,
          name: 'testTag',
          notes: [note],
        },
      ];
      const tagList = service.toTagList(note);
      expect(tagList).toHaveLength(1);
      expect(tagList[0]).toEqual(note.tags[0].name);
    });
  });

  describe('toNotePermissionsDto', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const group = Group.create('testGroup', 'testGroup', false) as Group;
      const note = Note.create(user) as Note;
      note.userPermissions = [
        {
          note: note,
          user: user,
          canEdit: true,
        },
      ];
      note.groupPermissions = [
        {
          note: note,
          group: group,
          canEdit: true,
        },
      ];
      const permissions = service.toNotePermissionsDto(note);
      expect(permissions.owner).not.toEqual(null);
      expect(permissions.owner?.username).toEqual(user.username);
      expect(permissions.sharedToUsers).toHaveLength(1);
      expect(permissions.sharedToUsers[0].user.username).toEqual(user.username);
      expect(permissions.sharedToUsers[0].canEdit).toEqual(true);
      expect(permissions.sharedToGroups).toHaveLength(1);
      expect(permissions.sharedToGroups[0].group.displayName).toEqual(
        group.displayName,
      );
      expect(permissions.sharedToGroups[0].canEdit).toEqual(true);
    });
  });

  describe('toNoteMetadataDto', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const author = Author.create(1);
      author.user = Promise.resolve(user);
      const group = Group.create('testGroup', 'testGroup', false) as Group;
      const content = 'testContent';
      jest
        .spyOn(noteRepo, 'save')
        .mockImplementation(async (note: Note): Promise<Note> => note);
      const note = await service.createNote(content, null);
      const revisions = await note.revisions;
      revisions[0].edits = [
        {
          revisions: revisions,
          startPos: 0,
          endPos: 1,
          updatedAt: new Date(1549312452000),
          author: author,
        } as Edit,
        {
          revisions: revisions,
          startPos: 0,
          endPos: 1,
          updatedAt: new Date(1549312452001),
          author: author,
        } as Edit,
      ];
      revisions[0].createdAt = new Date(1549312452000);
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValue(revisions[0]);
      const createQueryBuilder = {
        innerJoin: () => createQueryBuilder,
        where: () => createQueryBuilder,
        getMany: () => [user],
      };
      jest
        .spyOn(userRepo, 'createQueryBuilder')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockImplementation(() => createQueryBuilder);
      note.publicId = 'testId';
      note.aliases = [Alias.create('testAlias', note, true) as Alias];
      note.title = 'testTitle';
      note.description = 'testDescription';
      note.owner = user;
      note.userPermissions = [
        {
          note: note,
          user: user,
          canEdit: true,
        },
      ];
      note.groupPermissions = [
        {
          note: note,
          group: group,
          canEdit: true,
        },
      ];
      note.tags = [
        {
          id: 1,
          name: 'testTag',
          notes: [note],
        },
      ];
      note.viewCount = 1337;
      const metadataDto = await service.toNoteMetadataDto(note);
      expect(metadataDto.id).toEqual(note.publicId);
      expect(metadataDto.aliases).toHaveLength(1);
      expect(metadataDto.aliases[0]).toEqual(note.aliases[0].name);
      expect(metadataDto.title).toEqual(note.title);
      expect(metadataDto.createTime).toEqual(revisions[0].createdAt);
      expect(metadataDto.description).toEqual(note.description);
      expect(metadataDto.editedBy).toHaveLength(1);
      expect(metadataDto.editedBy[0]).toEqual(user.username);
      expect(metadataDto.permissions.owner.username).toEqual(user.username);
      expect(metadataDto.permissions.sharedToUsers).toHaveLength(1);
      expect(metadataDto.permissions.sharedToUsers[0].user.username).toEqual(
        user.username,
      );
      expect(metadataDto.permissions.sharedToUsers[0].canEdit).toEqual(true);
      expect(metadataDto.permissions.sharedToGroups).toHaveLength(1);
      expect(
        metadataDto.permissions.sharedToGroups[0].group.displayName,
      ).toEqual(group.displayName);
      expect(metadataDto.permissions.sharedToGroups[0].canEdit).toEqual(true);
      expect(metadataDto.tags).toHaveLength(1);
      expect(metadataDto.tags[0]).toEqual(note.tags[0].name);
      expect(metadataDto.updateTime).toEqual(revisions[0].createdAt);
      expect(metadataDto.updateUser.username).toEqual(user.username);
      expect(metadataDto.viewCount).toEqual(note.viewCount);
    });
  });

  describe('toNoteDto', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const author = Author.create(1);
      author.user = Promise.resolve(user);
      const otherUser = User.create('other hardcoded', 'Testy2') as User;
      otherUser.username = 'other hardcoded user';
      const group = Group.create('testGroup', 'testGroup', false) as Group;
      const content = 'testContent';
      jest
        .spyOn(noteRepo, 'save')
        .mockImplementation(async (note: Note): Promise<Note> => note);
      const note = await service.createNote(content, null);
      const revisions = await note.revisions;
      revisions[0].edits = [
        {
          revisions: revisions,
          startPos: 0,
          endPos: 1,
          updatedAt: new Date(1549312452000),
          author: author,
        } as Edit,
        {
          revisions: revisions,
          startPos: 0,
          endPos: 1,
          updatedAt: new Date(1549312452001),
          author: author,
        } as Edit,
      ];
      revisions[0].createdAt = new Date(1549312452000);
      jest
        .spyOn(revisionRepo, 'findOne')
        .mockResolvedValue(revisions[0])
        .mockResolvedValue(revisions[0]);
      const createQueryBuilder = {
        innerJoin: () => createQueryBuilder,
        where: () => createQueryBuilder,
        getMany: () => [user],
      };
      jest
        .spyOn(userRepo, 'createQueryBuilder')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockImplementation(() => createQueryBuilder);
      note.publicId = 'testId';
      note.aliases = [Alias.create('testAlias', note, true) as Alias];
      note.title = 'testTitle';
      note.description = 'testDescription';
      note.owner = user;
      note.userPermissions = [
        {
          note: note,
          user: user,
          canEdit: true,
        },
      ];
      note.groupPermissions = [
        {
          note: note,
          group: group,
          canEdit: true,
        },
      ];
      note.tags = [
        {
          id: 1,
          name: 'testTag',
          notes: [note],
        },
      ];
      note.viewCount = 1337;
      const noteDto = await service.toNoteDto(note);
      expect(noteDto.metadata.id).toEqual(note.publicId);
      expect(noteDto.metadata.aliases).toHaveLength(1);
      expect(noteDto.metadata.aliases[0]).toEqual(note.aliases[0].name);
      expect(noteDto.metadata.title).toEqual(note.title);
      expect(noteDto.metadata.createTime).toEqual(revisions[0].createdAt);
      expect(noteDto.metadata.description).toEqual(note.description);
      expect(noteDto.metadata.editedBy).toHaveLength(1);
      expect(noteDto.metadata.editedBy[0]).toEqual(user.username);
      expect(noteDto.metadata.permissions.owner.username).toEqual(
        user.username,
      );
      expect(noteDto.metadata.permissions.sharedToUsers).toHaveLength(1);
      expect(
        noteDto.metadata.permissions.sharedToUsers[0].user.username,
      ).toEqual(user.username);
      expect(noteDto.metadata.permissions.sharedToUsers[0].canEdit).toEqual(
        true,
      );
      expect(noteDto.metadata.permissions.sharedToGroups).toHaveLength(1);
      expect(
        noteDto.metadata.permissions.sharedToGroups[0].group.displayName,
      ).toEqual(group.displayName);
      expect(noteDto.metadata.permissions.sharedToGroups[0].canEdit).toEqual(
        true,
      );
      expect(noteDto.metadata.tags).toHaveLength(1);
      expect(noteDto.metadata.tags[0]).toEqual(note.tags[0].name);
      expect(noteDto.metadata.updateTime).toEqual(revisions[0].createdAt);
      expect(noteDto.metadata.updateUser.username).toEqual(user.username);
      expect(noteDto.metadata.viewCount).toEqual(note.viewCount);
      expect(noteDto.content).toEqual(content);
    });
  });
});
