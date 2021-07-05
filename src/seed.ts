/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createConnection } from 'typeorm';
import { Author } from './authors/author.entity';
import { Session } from './users/session.entity';
import { User } from './users/user.entity';
import { Note } from './notes/note.entity';
import { Revision } from './revisions/revision.entity';
import { Edit } from './revisions/edit.entity';
import { NoteGroupPermission } from './permissions/note-group-permission.entity';
import { NoteUserPermission } from './permissions/note-user-permission.entity';
import { Group } from './groups/group.entity';
import { HistoryEntry } from './history/history-entry.entity';
import { MediaUpload } from './media/media-upload.entity';
import { Tag } from './notes/tag.entity';
import { AuthToken } from './auth/auth-token.entity';
import { Identity } from './users/identity.entity';
import { Alias } from './notes/alias.entity';

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
      await connection.manager.save([notes[i], user, revision, edit, author]);
    }
    const foundUser = await connection.manager.findOne(User);
    if (!foundUser) {
      throw new Error('Could not find freshly seeded user. Aborting.');
    }
    const foundNote = await connection.manager.findOne(Note, {
      relations: ['aliases'],
    });
    if (!foundNote) {
      throw new Error('Could not find freshly seeded note. Aborting.');
    }
    if (!foundNote.aliases[0]) {
      throw new Error('Could not find alias of freshly seeded note. Aborting.');
    }
    const historyEntry = HistoryEntry.create(foundUser, foundNote);
    await connection.manager.save(historyEntry);
    console.log(`Created User '${foundUser.userName}'`);
    console.log(`Created Note '${foundNote.aliases[0].name}'`);
    console.log(`Created HistoryEntry`);
  })
  .catch((error) => console.log(error));
