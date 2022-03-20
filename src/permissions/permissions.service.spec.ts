/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { AuthToken } from '../auth/auth-token.entity';
import { Author } from '../authors/author.entity';
import appConfigMock from '../config/mock/app.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { PermissionsUpdateInconsistentError } from '../errors/errors';
import { Group } from '../groups/group.entity';
import { GroupsModule } from '../groups/groups.module';
import { SpecialGroup } from '../groups/groups.special';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Alias } from '../notes/alias.entity';
import {
  NoteGroupPermissionUpdateDto,
  NoteUserPermissionUpdateDto,
} from '../notes/note-permissions.dto';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { NoteGroupPermission } from './note-group-permission.entity';
import { NoteUserPermission } from './note-user-permission.entity';
import { PermissionsModule } from './permissions.module';
import { GuestPermission, PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let notes: Note[];
  let noteRepo: Repository<Note>;
  let userRepo: Repository<User>;
  let groupRepo: Repository<Group>;

  beforeAll(async () => {
    /**
     * We need to have *one* userRepo and *one* noteRepo for both the providers
     * array and the overrideProvider call, as otherwise we have two instances
     * and the mock of createQueryBuilder replaces the wrong one
     * **/
    userRepo = new Repository<User>(
      '',
      new EntityManager(
        new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }),
      ),
      undefined,
    );
    noteRepo = new Repository<Note>(
      '',
      new EntityManager(
        new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }),
      ),
      undefined,
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(Note),
          useValue: noteRepo,
        },
        {
          provide: getRepositoryToken(Group),
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
        PermissionsModule,
        UsersModule,
        NotesModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, noteConfigMock],
        }),
        GroupsModule,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepo)
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue(noteRepo)
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
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
      .overrideProvider(getRepositoryToken(Alias))
      .useValue({})
      .compile();
    service = module.get<PermissionsService>(PermissionsService);
    notes = await createNoteUserPermissionNotes();
    groupRepo = module.get<Repository<Group>>(getRepositoryToken(Group));
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
  });

  // The two users we test with:
  const user2 = {} as User;
  user2.id = '2';
  const user1 = {} as User;
  user1.id = '1';

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  function createNote(owner: User): Note {
    const note = {} as Note;
    note.userPermissions = Promise.resolve([]);
    note.groupPermissions = Promise.resolve([]);
    note.owner = Promise.resolve(owner);
    return note;
  }

  /*
   * Creates the permission objects for UserPermission for two users with write and with out write permission
   */
  async function createNoteUserPermissionNotes(): Promise<Note[]> {
    const note0 = createNote(user1);
    const note1 = createNote(user2);
    const note2 = createNote(user2);
    const note3 = createNote(user2);
    const note4 = createNote(user2);
    const note5 = createNote(user2);
    const note6 = createNote(user2);
    const note7 = createNote(user2);
    const noteUserPermission1 = {} as NoteUserPermission;
    noteUserPermission1.user = user1;
    const noteUserPermission2 = {} as NoteUserPermission;
    noteUserPermission2.user = user2;
    const noteUserPermission3 = {} as NoteUserPermission;
    noteUserPermission3.user = user1;
    noteUserPermission3.canEdit = true;
    const noteUserPermission4 = {} as NoteUserPermission;
    noteUserPermission4.user = user2;
    noteUserPermission4.canEdit = true;

    (await note1.userPermissions).push(noteUserPermission1);

    (await note2.userPermissions).push(noteUserPermission1);
    (await note2.userPermissions).push(noteUserPermission2);

    (await note3.userPermissions).push(noteUserPermission2);
    (await note3.userPermissions).push(noteUserPermission1);

    (await note4.userPermissions).push(noteUserPermission3);

    (await note5.userPermissions).push(noteUserPermission3);
    (await note5.userPermissions).push(noteUserPermission4);

    (await note6.userPermissions).push(noteUserPermission4);
    (await note6.userPermissions).push(noteUserPermission3);

    (await note7.userPermissions).push(noteUserPermission2);

    const everybody = {} as Group;
    everybody.name = SpecialGroup.EVERYONE;
    everybody.special = true;
    const noteEverybodyRead = createNote(user1);

    const noteGroupPermissionRead = {} as NoteGroupPermission;
    noteGroupPermissionRead.group = everybody;
    noteGroupPermissionRead.canEdit = false;
    noteGroupPermissionRead.note = noteEverybodyRead;
    noteEverybodyRead.groupPermissions = Promise.resolve([
      noteGroupPermissionRead,
    ]);

    const noteEverybodyWrite = createNote(user1);

    const noteGroupPermissionWrite = {} as NoteGroupPermission;
    noteGroupPermissionWrite.group = everybody;
    noteGroupPermissionWrite.canEdit = true;
    noteGroupPermissionWrite.note = noteEverybodyWrite;
    noteEverybodyWrite.groupPermissions = Promise.resolve([
      noteGroupPermissionWrite,
    ]);

    return [
      note0,
      note1,
      note2,
      note3,
      note4,
      note5,
      note6,
      note7,
      noteEverybodyRead,
      noteEverybodyWrite,
    ];
  }

  describe('mayRead works with', () => {
    it('Owner', async () => {
      service.guestPermission = GuestPermission.DENY;
      expect(await service.mayRead(user1, notes[0])).toBeTruthy();
      expect(await service.mayRead(user1, notes[7])).toBeFalsy();
    });
    it('userPermission read', async () => {
      service.guestPermission = GuestPermission.DENY;
      expect(await service.mayRead(user1, notes[1])).toBeTruthy();
      expect(await service.mayRead(user1, notes[2])).toBeTruthy();
      expect(await service.mayRead(user1, notes[3])).toBeTruthy();
    });
    it('userPermission write', async () => {
      service.guestPermission = GuestPermission.DENY;
      expect(await service.mayRead(user1, notes[4])).toBeTruthy();
      expect(await service.mayRead(user1, notes[5])).toBeTruthy();
      expect(await service.mayRead(user1, notes[6])).toBeTruthy();
      expect(await service.mayRead(user1, notes[7])).toBeFalsy();
    });

    describe('guest permission', () => {
      it('CREATE_ALIAS', async () => {
        service.guestPermission = GuestPermission.CREATE_ALIAS;
        expect(await service.mayRead(null, notes[8])).toBeTruthy();
      });
      it('CREATE', async () => {
        service.guestPermission = GuestPermission.CREATE;
        expect(await service.mayRead(null, notes[8])).toBeTruthy();
      });
      it('WRITE', async () => {
        service.guestPermission = GuestPermission.WRITE;
        expect(await service.mayRead(null, notes[8])).toBeTruthy();
      });
      it('READ', async () => {
        service.guestPermission = GuestPermission.READ;
        expect(await service.mayRead(null, notes[8])).toBeTruthy();
      });
    });
  });
  describe('mayWrite works with', () => {
    it('Owner', async () => {
      service.guestPermission = GuestPermission.DENY;
      expect(await service.mayWrite(user1, notes[0])).toBeTruthy();
      expect(await service.mayWrite(user1, notes[7])).toBeFalsy();
    });
    it('userPermission read', async () => {
      service.guestPermission = GuestPermission.DENY;
      expect(await service.mayWrite(user1, notes[1])).toBeFalsy();
      expect(await service.mayWrite(user1, notes[2])).toBeFalsy();
      expect(await service.mayWrite(user1, notes[3])).toBeFalsy();
    });
    it('userPermission write', async () => {
      service.guestPermission = GuestPermission.DENY;
      expect(await service.mayWrite(user1, notes[4])).toBeTruthy();
      expect(await service.mayWrite(user1, notes[5])).toBeTruthy();
      expect(await service.mayWrite(user1, notes[6])).toBeTruthy();
      expect(await service.mayWrite(user1, notes[7])).toBeFalsy();
    });
    describe('guest permission', () => {
      it('CREATE_ALIAS', async () => {
        service.guestPermission = GuestPermission.CREATE_ALIAS;
        expect(await service.mayWrite(null, notes[9])).toBeTruthy();
      });
      it('CREATE', async () => {
        service.guestPermission = GuestPermission.CREATE;
        expect(await service.mayWrite(null, notes[9])).toBeTruthy();
      });
      it('WRITE', async () => {
        service.guestPermission = GuestPermission.WRITE;
        expect(await service.mayWrite(null, notes[9])).toBeTruthy();
      });
      it('READ', async () => {
        service.guestPermission = GuestPermission.READ;
        expect(await service.mayWrite(null, notes[9])).toBeFalsy();
      });
    });
  });

  /*
   * Helper Object that arranges a list of GroupPermissions and if they allow a user to read or write a particular note.
   */
  class NoteGroupPermissionWithResultForUser {
    permissions: NoteGroupPermission[];
    allowsRead: boolean;
    allowsWrite: boolean;
  }

  /*
   * Setup function to create all the groups we use in the tests.
   */
  function createGroups(): { [id: string]: Group } {
    const result: { [id: string]: Group } = {};

    const everybody: Group = Group.create(
      SpecialGroup.EVERYONE,
      SpecialGroup.EVERYONE,
      true,
    ) as Group;
    result[SpecialGroup.EVERYONE] = everybody;

    const loggedIn = Group.create(
      SpecialGroup.LOGGED_IN,
      SpecialGroup.LOGGED_IN,
      true,
    ) as Group;
    result[SpecialGroup.LOGGED_IN] = loggedIn;

    const user1group = Group.create('user1group', 'user1group', false) as Group;
    user1group.members = Promise.resolve([user1]);
    result['user1group'] = user1group;

    const user2group = Group.create('user2group', 'user2group', false) as Group;
    user2group.members = Promise.resolve([user2]);
    result['user2group'] = user2group;

    const user1and2group = Group.create(
      'user1and2group',
      'user1and2group',
      false,
    ) as Group;
    user1and2group.members = Promise.resolve([user1, user2]);
    result['user1and2group'] = user1and2group;

    const user2and1group = Group.create(
      'user2and1group',
      'user2and1group',
      false,
    ) as Group;
    user2and1group.members = Promise.resolve([user2, user1]);
    result['user2and1group'] = user2and1group;

    return result;
  }

  /*
   * Create all GroupPermissions: For each group two GroupPermissions are created one with read permission and one with write permission.
   */
  function createAllNoteGroupPermissions(): NoteGroupPermission[][] {
    const groups = createGroups();

    /*
     * Helper function for creating GroupPermissions
     */
    function createNoteGroupPermission(
      group: Group,
      write: boolean,
    ): NoteGroupPermission {
      return NoteGroupPermission.create(group, {} as Note, write);
    }

    const everybodyRead = createNoteGroupPermission(
      groups[SpecialGroup.EVERYONE],
      false,
    );
    const everybodyWrite = createNoteGroupPermission(
      groups[SpecialGroup.EVERYONE],
      true,
    );

    const loggedInRead = createNoteGroupPermission(
      groups[SpecialGroup.LOGGED_IN],
      false,
    );
    const loggedInWrite = createNoteGroupPermission(
      groups[SpecialGroup.LOGGED_IN],
      true,
    );

    const user1groupRead = createNoteGroupPermission(
      groups['user1group'],
      false,
    );
    const user1groupWrite = createNoteGroupPermission(
      groups['user1group'],
      true,
    );

    const user2groupRead = createNoteGroupPermission(
      groups['user2group'],
      false,
    );
    const user2groupWrite = createNoteGroupPermission(
      groups['user2group'],
      true,
    );

    const user1and2groupRead = createNoteGroupPermission(
      groups['user1and2group'],
      false,
    );
    const user1and2groupWrite = createNoteGroupPermission(
      groups['user1and2group'],
      true,
    );

    const user2and1groupRead = createNoteGroupPermission(
      groups['user2and1group'],
      false,
    );
    const user2and1groupWrite = createNoteGroupPermission(
      groups['user2and1group'],
      true,
    );

    return [
      [user1groupRead, user1and2groupRead, user2and1groupRead, null], // group0: allow user1 to read via group
      [user2and1groupWrite, user1and2groupWrite, user1groupWrite, null], // group1: allow user1 to write via group
      [everybodyRead, everybodyWrite, null], // group2: permissions of the special group everybody
      [loggedInRead, loggedInWrite, null], // group3: permissions of the special group loggedIn
      [user2groupWrite, user2groupRead, null], // group4: don't allow user1 to read or write via group
    ];
  }

  /*
   * creates the matrix multiplication of group0 to group4 of createAllNoteGroupPermissions
   */
  function createNoteGroupPermissionsCombinations(
    guestPermission: GuestPermission,
  ): NoteGroupPermissionWithResultForUser[] {
    // for logged in users
    const noteGroupPermissions = createAllNoteGroupPermissions();
    const result: NoteGroupPermissionWithResultForUser[] = [];
    for (const group0 of noteGroupPermissions[0]) {
      for (const group1 of noteGroupPermissions[1]) {
        for (const group2 of noteGroupPermissions[2]) {
          for (const group3 of noteGroupPermissions[3]) {
            for (const group4 of noteGroupPermissions[4]) {
              const insert: NoteGroupPermission[] = [];
              let readPermission = false;
              let writePermission = false;
              if (group0 !== null) {
                // user1 in ReadGroups
                readPermission = true;
                insert.push(group0);
              }
              if (group1 !== null) {
                // user1 in WriteGroups
                readPermission = true;
                writePermission = true;
                insert.push(group1);
              }

              if (group2 !== null) {
                // everybody group TODO config options
                switch (guestPermission) {
                  case GuestPermission.CREATE_ALIAS:
                  case GuestPermission.CREATE:
                  case GuestPermission.WRITE:
                    writePermission = writePermission || group2.canEdit;
                    readPermission = true;
                    break;
                  case GuestPermission.READ:
                    readPermission = true;
                }
                insert.push(group2);
              }
              if (group3 !== null) {
                // loggedIn users
                readPermission = true;
                writePermission = writePermission || group3.canEdit;
                insert.push(group3);
              }
              if (group4 !== null) {
                // user not in group
                insert.push(group4);
              }
              result.push({
                permissions: insert,
                allowsRead: readPermission,
                allowsWrite: writePermission,
              });
            }
          }
        }
      }
    }
    return result;
  }

  // inspired by https://stackoverflow.com/questions/9960908/permutations-in-javascript
  function permutator(
    inputArr: NoteGroupPermission[],
  ): NoteGroupPermission[][] {
    const results: NoteGroupPermission[][] = [];

    function permute(
      arr: NoteGroupPermission[],
      memo: NoteGroupPermission[],
    ): NoteGroupPermission[][] {
      let cur: NoteGroupPermission[];

      for (let i = 0; i < arr.length; i++) {
        cur = arr.splice(i, 1);
        if (arr.length === 0) {
          results.push(memo.concat(cur));
        }
        permute(arr.slice(), memo.concat(cur));
        arr.splice(i, 0, cur[0]);
      }

      return results;
    }

    return permute(inputArr, []);
  }

  // takes each set of permissions from createNoteGroupPermissionsCombinations, permute them and add them to the list
  function permuteNoteGroupPermissions(
    noteGroupPermissions: NoteGroupPermissionWithResultForUser[],
  ): NoteGroupPermissionWithResultForUser[] {
    const result: NoteGroupPermissionWithResultForUser[] = [];
    for (const permission of noteGroupPermissions) {
      const permutations = permutator(permission.permissions);
      for (const permutation of permutations) {
        result.push({
          permissions: permutation,
          allowsRead: permission.allowsRead,
          allowsWrite: permission.allowsWrite,
        });
      }
    }
    return result;
  }

  describe('check if groups work with', () => {
    const guestPermission = GuestPermission.WRITE;
    const rawPermissions =
      createNoteGroupPermissionsCombinations(guestPermission);
    const permissions = permuteNoteGroupPermissions(rawPermissions);
    let i = 0;
    for (const permission of permissions) {
      const note = createNote(user2);
      note.groupPermissions = Promise.resolve(permission.permissions);
      let permissionString = '';
      for (const perm of permission.permissions) {
        permissionString += ` ${perm.group.name}:${String(perm.canEdit)}`;
      }
      it(`mayWrite - test #${i}:${permissionString}`, async () => {
        service.guestPermission = guestPermission;
        expect(await service.mayWrite(user1, note)).toEqual(
          permission.allowsWrite,
        );
      });
      it(`mayRead - test #${i}:${permissionString}`, async () => {
        service.guestPermission = guestPermission;
        expect(await service.mayRead(user1, note)).toEqual(
          permission.allowsRead,
        );
      });
      i++;
    }
  });

  describe('mayCreate works for', () => {
    it('logged in', () => {
      service.guestPermission = GuestPermission.DENY;
      expect(service.mayCreate(user1)).toBeTruthy();
    });
    it('guest denied', () => {
      service.guestPermission = GuestPermission.DENY;
      expect(service.mayCreate(null)).toBeFalsy();
    });
    it('guest read', () => {
      service.guestPermission = GuestPermission.READ;
      expect(service.mayCreate(null)).toBeFalsy();
    });
    it('guest write', () => {
      service.guestPermission = GuestPermission.WRITE;
      expect(service.mayCreate(null)).toBeFalsy();
    });
    it('guest create', () => {
      service.guestPermission = GuestPermission.CREATE;
      expect(service.mayCreate(null)).toBeTruthy();
    });
    it('guest create alias', () => {
      service.guestPermission = GuestPermission.CREATE_ALIAS;
      expect(service.mayCreate(null)).toBeTruthy();
    });
  });

  describe('isOwner works', () => {
    it('for positive case', async () => {
      service.guestPermission = GuestPermission.DENY;
      expect(await service.isOwner(user1, notes[0])).toBeTruthy();
    });
    it('for negative case', async () => {
      service.guestPermission = GuestPermission.DENY;
      expect(await service.isOwner(user1, notes[1])).toBeFalsy();
    });
  });

  describe('updateNotePermissions', () => {
    const userPermissionUpdate = new NoteUserPermissionUpdateDto();
    userPermissionUpdate.username = 'hardcoded';
    userPermissionUpdate.canEdit = true;
    const groupPermissionUpdate = new NoteGroupPermissionUpdateDto();
    groupPermissionUpdate.groupName = 'testGroup';
    groupPermissionUpdate.canEdit = false;
    const user = User.create(userPermissionUpdate.username, 'Testy') as User;
    const group = Group.create(
      groupPermissionUpdate.groupName,
      groupPermissionUpdate.groupName,
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
        expect(await savedNote.userPermissions).toHaveLength(0);
        expect(await savedNote.groupPermissions).toHaveLength(0);
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
        expect(await savedNote.userPermissions).toHaveLength(1);
        expect((await savedNote.userPermissions)[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(await savedNote.groupPermissions).toHaveLength(0);
      });
      it('with empty GroupPermissions and with existing UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.userPermissions = Promise.resolve([
          {
            noteId: '',
            note: noteWithPreexistingPermissions,
            userId: '',
            user: user,
            canEdit: !userPermissionUpdate.canEdit,
          },
        ]);
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
        expect(await savedNote.userPermissions).toHaveLength(1);
        expect((await savedNote.userPermissions)[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(await savedNote.groupPermissions).toHaveLength(0);
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
          sharedToGroups: [groupPermissionUpdate],
        });
        expect(await savedNote.userPermissions).toHaveLength(0);
        expect((await savedNote.groupPermissions)[0].group.name).toEqual(
          groupPermissionUpdate.groupName,
        );
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
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
          sharedToGroups: [groupPermissionUpdate],
        });
        expect((await savedNote.userPermissions)[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect((await savedNote.groupPermissions)[0].group.name).toEqual(
          groupPermissionUpdate.groupName,
        );
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with new GroupPermissions and with existing UserPermissions', async () => {
        const noteWithUserPermission: Note = { ...note };
        noteWithUserPermission.userPermissions = Promise.resolve([
          {
            noteId: '',
            note: noteWithUserPermission,
            userId: '',
            user: user,
            canEdit: !userPermissionUpdate.canEdit,
          },
        ]);
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
            sharedToGroups: [groupPermissionUpdate],
          },
        );
        expect((await savedNote.userPermissions)[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect((await savedNote.groupPermissions)[0].group.name).toEqual(
          groupPermissionUpdate.groupName,
        );
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with existing GroupPermissions and with empty UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = Promise.resolve([
          {
            noteId: '',
            note: noteWithPreexistingPermissions,
            groupId: 0,
            group: group,
            canEdit: !groupPermissionUpdate.canEdit,
          },
        ]);
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
            sharedToGroups: [groupPermissionUpdate],
          },
        );
        expect(await savedNote.userPermissions).toHaveLength(0);
        expect((await savedNote.groupPermissions)[0].group.name).toEqual(
          groupPermissionUpdate.groupName,
        );
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with existing GroupPermissions and with new UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = Promise.resolve([
          {
            noteId: '',
            note: noteWithPreexistingPermissions,
            groupId: 0,
            group: group,
            canEdit: !groupPermissionUpdate.canEdit,
          },
        ]);
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
            sharedToGroups: [groupPermissionUpdate],
          },
        );
        expect((await savedNote.userPermissions)[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect((await savedNote.groupPermissions)[0].group.name).toEqual(
          groupPermissionUpdate.groupName,
        );
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with existing GroupPermissions and with existing UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = Promise.resolve([
          {
            noteId: '',
            note: noteWithPreexistingPermissions,
            groupId: 0,
            group: group,
            canEdit: !groupPermissionUpdate.canEdit,
          },
        ]);
        noteWithPreexistingPermissions.userPermissions = Promise.resolve([
          {
            noteId: '',
            note: noteWithPreexistingPermissions,
            userId: '',
            user: user,
            canEdit: !userPermissionUpdate.canEdit,
          },
        ]);
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
            sharedToGroups: [groupPermissionUpdate],
          },
        );
        expect((await savedNote.userPermissions)[0].user.username).toEqual(
          userPermissionUpdate.username,
        );
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect((await savedNote.groupPermissions)[0].group.name).toEqual(
          groupPermissionUpdate.groupName,
        );
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
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
            sharedToGroups: [groupPermissionUpdate, groupPermissionUpdate],
          }),
        ).rejects.toThrow(PermissionsUpdateInconsistentError);
      });

      it('userPermissions and groupPermissions have duplicate entries', async () => {
        await expect(
          service.updateNotePermissions(note, {
            sharedToUsers: [userPermissionUpdate, userPermissionUpdate],
            sharedToGroups: [groupPermissionUpdate, groupPermissionUpdate],
          }),
        ).rejects.toThrow(PermissionsUpdateInconsistentError);
      });
    });
  });

  describe('setUserPermission', () => {
    describe('works', () => {
      it('with user not added before and editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        const resultNote = await service.setUserPermission(note, user, true);
        const noteUserPermission = NoteUserPermission.create(user, note, true);
        expect((await resultNote.userPermissions)[0]).toStrictEqual(
          noteUserPermission,
        );
      });
      it('with user not added before and not editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        const resultNote = await service.setUserPermission(note, user, false);
        const noteUserPermission = NoteUserPermission.create(user, note, false);
        expect((await resultNote.userPermissions)[0]).toStrictEqual(
          noteUserPermission,
        );
      });
      it('with user added before and editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        note.userPermissions = Promise.resolve([
          NoteUserPermission.create(user, note, false),
        ]);

        const resultNote = await service.setUserPermission(note, user, true);
        const noteUserPermission = NoteUserPermission.create(user, note, true);
        expect((await resultNote.userPermissions)[0]).toStrictEqual(
          noteUserPermission,
        );
      });
      it('with user added before and not editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        note.userPermissions = Promise.resolve([
          NoteUserPermission.create(user, note, true),
        ]);
        const resultNote = await service.setUserPermission(note, user, false);
        const noteUserPermission = NoteUserPermission.create(user, note, false);
        expect((await resultNote.userPermissions)[0]).toStrictEqual(
          noteUserPermission,
        );
      });
    });
  });

  describe('removeUserPermission', () => {
    describe('works', () => {
      it('with user added before and editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        note.userPermissions = Promise.resolve([
          NoteUserPermission.create(user, note, true),
        ]);

        const resultNote = await service.removeUserPermission(note, user);
        expect((await resultNote.userPermissions).length).toStrictEqual(0);
      });
      it('with user not added before and not editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        note.userPermissions = Promise.resolve([
          NoteUserPermission.create(user, note, false),
        ]);
        const resultNote = await service.removeUserPermission(note, user);
        expect((await resultNote.userPermissions).length).toStrictEqual(0);
      });
    });
  });

  describe('setGroupPermission', () => {
    describe('works', () => {
      it('with group not added before and editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        const resultNote = await service.setGroupPermission(note, group, true);
        const noteGroupPermission = NoteGroupPermission.create(
          group,
          note,
          true,
        );
        expect((await resultNote.groupPermissions)[0]).toStrictEqual(
          noteGroupPermission,
        );
      });
      it('with group not added before and not editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        const resultNote = await service.setGroupPermission(note, group, false);
        const noteGroupPermission = NoteGroupPermission.create(
          group,
          note,
          false,
        );
        expect((await resultNote.groupPermissions)[0]).toStrictEqual(
          noteGroupPermission,
        );
      });
      it('with group added before and editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        note.groupPermissions = Promise.resolve([
          NoteGroupPermission.create(group, note, false),
        ]);

        const resultNote = await service.setGroupPermission(note, group, true);
        const noteGroupPermission = NoteGroupPermission.create(
          group,
          note,
          true,
        );
        expect((await resultNote.groupPermissions)[0]).toStrictEqual(
          noteGroupPermission,
        );
      });
      it('with group added before and not editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        note.groupPermissions = Promise.resolve([
          NoteGroupPermission.create(group, note, true),
        ]);
        const resultNote = await service.setGroupPermission(note, group, false);
        const noteGroupPermission = NoteGroupPermission.create(
          group,
          note,
          false,
        );
        expect((await resultNote.groupPermissions)[0]).toStrictEqual(
          noteGroupPermission,
        );
      });
    });
  });

  describe('removeGroupPermission', () => {
    describe('works', () => {
      it('with user added before and editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        note.groupPermissions = Promise.resolve([
          NoteGroupPermission.create(group, note, true),
        ]);

        const resultNote = await service.removeGroupPermission(note, group);
        expect((await resultNote.groupPermissions).length).toStrictEqual(0);
      });
      it('with user not added before and not editable', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (entry: Note) => {
            return entry;
          });
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        note.groupPermissions = Promise.resolve([
          NoteGroupPermission.create(group, note, false),
        ]);
        const resultNote = await service.removeGroupPermission(note, group);
        expect((await resultNote.groupPermissions).length).toStrictEqual(0);
      });
    });
  });

  describe('changeOwner', () => {
    it('works', async () => {
      const note = Note.create(null) as Note;
      const user = User.create('test', 'Testy') as User;
      jest
        .spyOn(noteRepo, 'save')
        .mockImplementationOnce(async (entry: Note) => {
          return entry;
        });
      const resultNote = await service.changeOwner(note, user);
      expect(await resultNote.owner).toStrictEqual(user);
    });
  });
});
