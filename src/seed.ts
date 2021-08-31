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
  ],
  synchronize: true,
  logging: false,
  dropSchema: true,
})
  .then(async (connection) => {
    const password = 'test_password';
    const users = [];
    users.push(User.create('hardcoded', 'Test User 1'));
    users.push(User.create('hardcoded_2', 'Test User 2'));
    users.push(User.create('hardcoded_3', 'Test User 3'));
    const notes: Note[] = [];
    notes.push(Note.create(undefined, 'test'));
    notes.push(Note.create(undefined, 'test2'));
    notes.push(Note.create(undefined, 'test3'));

    for (let i = 0; i < 3; i++) {
      const author = connection.manager.create(Author, Author.create(1));
      const user = connection.manager.create(User, users[i]);
      const identity = Identity.create(user, ProviderType.LOCAL);
      identity.passwordHash = await hashPassword(password);
      connection.manager.create(Identity, identity);
      author.user = user;
      const revision = Revision.create(
        'This is a test note',
        'This is a test note',
      );
      const edit = Edit.create(author, 1, 42);
      revision.edits = [edit];
      notes[i].revisions = Promise.all([revision]);
      notes[i].userPermissions = [];
      notes[i].groupPermissions = [];
      user.ownedNotes = [notes[i]];
      await connection.manager.save([
        notes[i],
        user,
        revision,
        edit,
        author,
        identity,
      ]);
    }
    const foundUsers = await connection.manager.find(User);
    if (!foundUsers) {
      throw new Error('Could not find freshly seeded users. Aborting.');
    }
    const foundNotes = await connection.manager.find(Note);
    if (!foundNotes) {
      throw new Error('Could not find freshly seeded notes. Aborting.');
    }
    for (const note of foundNotes) {
      if (!note.alias) {
        throw new Error(
          'Could not find alias of freshly seeded notes. Aborting.',
        );
      }
    }
    for (const user of foundUsers) {
      console.log(
        `Created User '${user.userName}' with password '${password}'`,
      );
    }
    for (const note of foundNotes) {
      console.log(`Created Note '${note.alias ?? ''}'`);
    }
    for (const user of foundUsers) {
      for (const note of foundNotes) {
        const historyEntry = HistoryEntry.create(user, note);
        await connection.manager.save(historyEntry);
        console.log(
          `Created HistoryEntry for user '${user.userName}' and note '${
            note.alias ?? ''
          }'`,
        );
      }
    }
  })
  .catch((error) => console.log(error));
