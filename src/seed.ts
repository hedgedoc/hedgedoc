/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DataSource } from 'typeorm';

import { AuthToken } from './auth/auth-token.entity';
import { Author } from './authors/author.entity';
import { Group } from './groups/group.entity';
import { HistoryEntry } from './history/history-entry.entity';
import { Identity } from './identity/identity.entity';
import { ProviderType } from './identity/provider-type.enum';
import { MediaUpload } from './media/media-upload.entity';
import { Alias } from './notes/alias.entity';
import { Note } from './notes/note.entity';
import { Tag } from './notes/tag.entity';
import { NoteGroupPermission } from './permissions/note-group-permission.entity';
import { NoteUserPermission } from './permissions/note-user-permission.entity';
import { Edit } from './revisions/edit.entity';
import { Revision } from './revisions/revision.entity';
import { Session } from './users/session.entity';
import { User } from './users/user.entity';
import { hashPassword } from './utils/password';

/**
 * This function creates and populates a sqlite db for manual testing
 */
const dataSource = new DataSource({
  type: 'sqlite',
  database: './hedgedoc.sqlite',
  entities: [
    User,
    Note,
    Revision,
    Edit,
    NoteGroupPermission,
    NoteUserPermission,
    Group,
    HistoryEntry,
    MediaUpload,
    Tag,
    AuthToken,
    Identity,
    Author,
    Session,
    Alias,
  ],
  synchronize: true,
  logging: false,
  dropSchema: true,
});

dataSource
  .initialize()
  .then(async () => {
    const password = 'test_password';
    const users = [];
    users.push(User.create('hardcoded', 'Test User 1'));
    users.push(User.create('hardcoded_2', 'Test User 2'));
    users.push(User.create('hardcoded_3', 'Test User 3'));
    const notes: Note[] = [];
    notes.push(Note.create(null, 'test') as Note);
    notes.push(Note.create(null, 'test2') as Note);
    notes.push(Note.create(null, 'test3') as Note);

    for (let i = 0; i < 3; i++) {
      const author = (await dataSource.manager.save(
        dataSource.manager.create(Author, Author.create(1)),
      )) as Author;
      const user = (await dataSource.manager.save(
        dataSource.manager.create(User, users[i]),
      )) as User;
      const identity = Identity.create(user, ProviderType.LOCAL, false);
      identity.passwordHash = await hashPassword(password);
      dataSource.manager.create(Identity, identity);
      author.user = dataSource.manager.save(user);
      const revision = Revision.create(
        'This is a test note',
        'This is a test note',
        notes[i],
      ) as Revision;
      const edit = Edit.create(author, 1, 42) as Edit;
      revision.edits = Promise.resolve([edit]);
      notes[i].revisions = Promise.all([revision]);
      notes[i].userPermissions = Promise.resolve([]);
      notes[i].groupPermissions = Promise.resolve([]);
      user.ownedNotes = Promise.resolve([notes[i]]);
      await dataSource.manager.save([
        notes[i],
        user,
        revision,
        edit,
        author,
        identity,
      ]);
    }
    const foundUsers = await dataSource.manager.find(User);
    if (!foundUsers) {
      throw new Error('Could not find freshly seeded users. Aborting.');
    }
    const foundNotes = await dataSource.manager.find(Note, {
      relations: ['aliases'],
    });
    if (!foundNotes) {
      throw new Error('Could not find freshly seeded notes. Aborting.');
    }
    for (const note of foundNotes) {
      if (!(await note.aliases)[0]) {
        throw new Error(
          'Could not find alias of freshly seeded notes. Aborting.',
        );
      }
    }
    for (const user of foundUsers) {
      console.log(
        `Created User '${user.username}' with password '${password}'`,
      );
    }
    for (const note of foundNotes) {
      console.log(`Created Note '${(await note.aliases)[0].name ?? ''}'`);
    }
    for (const user of foundUsers) {
      for (const note of foundNotes) {
        const historyEntry = HistoryEntry.create(user, note);
        await dataSource.manager.save(historyEntry);
        console.log(
          `Created HistoryEntry for user '${user.username}' and note '${
            (await note.aliases)[0].name ?? ''
          }'`,
        );
      }
    }
  })
  .catch((error) => console.log(error));
