/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createConnection } from 'typeorm';

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
createConnection({
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
})
  .then(async (connection) => {
    const password = 'TopSecret!';
    const users = [];
    users.push(User.create('backend1', 'Backend User 1'));
    users.push(User.create('backend2', 'Backend User 2'));
    users.push(User.create('backend3', 'Backend User 3'));
    const notes: Note[] = [];
    notes.push(Note.create(null, 'note1') as Note);
    notes.push(Note.create(null, 'note2') as Note);
    notes.push(Note.create(null, 'note3') as Note);

    for (let i = 0; i < 3; i++) {
      const user = connection.manager.create(User, users[i]);
      const identity = Identity.create(user, ProviderType.LOCAL, false);
      identity.passwordHash = await hashPassword(password);
      connection.manager.create(Identity, identity);
      await connection.manager.save([user, identity]);
    }

    const createdUsers = await connection.manager.find(User);
    const groupEveryone = connection.manager.create(
      Group,
      Group.create('_EVERYONE', 'Everyone', true),
    );
    const groupLoggedIn = connection.manager.create(
      Group,
      Group.create('_LOGGED_IN', 'Logged-in users', true),
    );
    await connection.manager.save([groupEveryone, groupLoggedIn]);

    for (let i = 0; i < 3; i++) {
      const author = connection.manager.create(Author, Author.create(1));
      author.user = Promise.resolve(createdUsers[0]);
      const revision = Revision.create(
        'This is a test note',
        'This is a test note',
        notes[i],
      ) as Revision;
      const edit = Edit.create(author, 1, 42) as Edit;
      revision.edits = Promise.resolve([edit]);
      notes[i].revisions = Promise.all([revision]);
      await connection.manager.save([notes[i], revision, edit, author]);

      if (i === 0) {
        const permission1 = NoteUserPermission.create(
          createdUsers[0],
          notes[i],
          true,
        );
        const permission2 = NoteUserPermission.create(
          createdUsers[1],
          notes[i],
          false,
        );
        notes[i].userPermissions = Promise.resolve([permission1, permission2]);
        notes[i].groupPermissions = Promise.resolve([]);
        await connection.manager.save([notes[i], permission1, permission2]);
      }

      if (i === 1) {
        const readPermission = NoteGroupPermission.create(
          groupEveryone,
          notes[i],
          false,
        );
        notes[i].userPermissions = Promise.resolve([]);
        notes[i].groupPermissions = Promise.resolve([readPermission]);
        await connection.manager.save([notes[i], readPermission]);
      }

      if (i === 2) {
        notes[i].owner = Promise.resolve(createdUsers[0]);
        await connection.manager.save([notes[i]]);
      }
    }
    const foundUsers = await connection.manager.find(User);
    if (!foundUsers) {
      throw new Error('Could not find freshly seeded users. Aborting.');
    }
    const foundNotes = await connection.manager.find(Note, {
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
        await connection.manager.save(historyEntry);
        console.log(
          `Created HistoryEntry for user '${user.username}' and note '${
            (await note.aliases)[0].name ?? ''
          }'`,
        );
      }
    }
  })
  .catch((error) => console.log(error));
