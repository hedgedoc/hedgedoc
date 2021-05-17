/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createConnection } from 'typeorm';
import { User } from './users/user.entity';
import { Note } from './notes/note.entity';
import { Revision } from './revisions/revision.entity';
import { Authorship } from './revisions/authorship.entity';
import { NoteGroupPermission } from './permissions/note-group-permission.entity';
import { NoteUserPermission } from './permissions/note-user-permission.entity';
import { Group } from './groups/group.entity';
import { HistoryEntry } from './history/history-entry.entity';
import { MediaUpload } from './media/media-upload.entity';
import { Tag } from './notes/tag.entity';
import { AuthToken } from './auth/auth-token.entity';
import { Identity } from './users/identity.entity';

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
    Authorship,
    NoteGroupPermission,
    NoteUserPermission,
    Group,
    HistoryEntry,
    MediaUpload,
    Tag,
    AuthToken,
    Identity,
  ],
  synchronize: true,
  logging: false,
})
  .then(async (connection) => {
    const user = User.create('hardcoded', 'Test User');
    const note = Note.create(undefined, 'test');
    const revision = Revision.create(
      'This is a test note',
      'This is a test note',
    );
    note.revisions = Promise.all([revision]);
    note.userPermissions = [];
    note.groupPermissions = [];
    user.ownedNotes = [note];
    await connection.manager.save([user, note, revision]);
    const foundUser = await connection.manager.findOne(User);
    if (!foundUser) {
      throw new Error('Could not find freshly seeded user. Aborting.');
    }
    const foundNote = await connection.manager.findOne(Note);
    if (!foundNote) {
      throw new Error('Could not find freshly seeded note. Aborting.');
    }
    if (!foundNote.alias) {
      throw new Error('Could not find alias of freshly seeded note. Aborting.');
    }
    const historyEntry = HistoryEntry.create(foundUser, foundNote);
    await connection.manager.save(historyEntry);
    console.log(`Created User '${foundUser.userName}'`);
    console.log(`Created Note '${foundNote.alias}'`);
    console.log(`Created HistoryEntry`);
  })
  .catch((error) => console.log(error));
