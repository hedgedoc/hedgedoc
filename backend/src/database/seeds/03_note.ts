/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteType } from '@hedgedoc/commons';
import { createPatch } from 'diff';
import { readFileSync } from 'fs';
import { Knex } from 'knex';

import { extractRevisionMetadataFromContent } from '../../revisions/utils/extract-revision-metadata-from-content';
import {
  FieldNameAlias,
  FieldNameAuthorshipInfo,
  FieldNameNote,
  FieldNameNoteGroupPermission,
  FieldNameNoteUserPermission,
  FieldNameRevision,
  FieldNameRevisionTag,
  TableAlias,
  TableAuthorshipInfo,
  TableNote,
  TableNoteGroupPermission,
  TableNoteUserPermission,
  TableRevision,
  TableRevisionTag,
} from '../types';

export async function seed(knex: Knex): Promise<void> {
  // Clear tables beforehand
  await knex(TableNote).del();
  await knex(TableAlias).del();
  await knex(TableRevision).del();
  await knex(TableRevisionTag).del();
  await knex(TableAuthorshipInfo).del();
  await knex(TableNoteGroupPermission).del();
  await knex(TableNoteUserPermission).del();

  const guestNoteAlias = 'guest-note';
  const userNoteAlias = 'user-note';
  const userSlideAlias = 'user-slide';

  const guestNoteContent = readFileSync('./notes/guest_note.md', 'utf-8');
  const userNoteContent = readFileSync('./notes/local_user_note.md', 'utf-8');
  const userSlideContent = readFileSync('./notes/local_user_slide.md', 'utf-8');

  const {
    title: guestNoteTitle,
    description: guestNoteDescription,
    tags: guestNoteTags,
  } = extractRevisionMetadataFromContent(guestNoteContent);
  const {
    title: userNoteTitle,
    description: userNoteDescription,
    tags: userNoteTags,
  } = extractRevisionMetadataFromContent(userNoteContent);
  const {
    title: userSlideTitle,
    description: userSlideDescription,
    tags: userSlideTags,
  } = extractRevisionMetadataFromContent(userSlideContent);

  // Insert a few notes and revisions
  await knex(TableNote).insert([
    {
      [FieldNameNote.ownerId]: 1,
      [FieldNameNote.version]: 2,
    },
    {
      [FieldNameNote.ownerId]: 2,
      [FieldNameNote.version]: 2,
    },
    {
      [FieldNameNote.ownerId]: 2,
      [FieldNameNote.version]: 2,
    },
  ]);
  await knex(TableAlias).insert([
    {
      [FieldNameAlias.noteId]: 1,
      [FieldNameAlias.alias]: guestNoteAlias,
      [FieldNameAlias.isPrimary]: true,
    },
    {
      [FieldNameAlias.noteId]: 2,
      [FieldNameAlias.alias]: userNoteAlias,
      [FieldNameAlias.isPrimary]: true,
    },
    {
      [FieldNameAlias.noteId]: 1,
      [FieldNameAlias.alias]: userSlideAlias,
      [FieldNameAlias.isPrimary]: true,
    },
  ]);
  await knex(TableRevision).insert([
    {
      [FieldNameRevision.noteId]: 1,
      [FieldNameRevision.patch]: createPatch(
        guestNoteAlias,
        '',
        guestNoteContent,
      ),
      [FieldNameRevision.content]: guestNoteContent,
      [FieldNameRevision.yjsStateVector]: null,
      [FieldNameRevision.noteType]: NoteType.DOCUMENT,
      [FieldNameRevision.title]: guestNoteTitle,
      [FieldNameRevision.description]: guestNoteDescription,
    },
    {
      [FieldNameRevision.noteId]: 1,
      [FieldNameRevision.patch]: createPatch(
        userNoteAlias,
        '',
        userNoteContent,
      ),
      [FieldNameRevision.content]: userNoteContent,
      [FieldNameRevision.yjsStateVector]: null,
      [FieldNameRevision.noteType]: NoteType.DOCUMENT,
      [FieldNameRevision.title]: userNoteTitle,
      [FieldNameRevision.description]: userNoteDescription,
    },
    {
      [FieldNameRevision.noteId]: 1,
      [FieldNameRevision.patch]: createPatch(
        userSlideAlias,
        '',
        userSlideContent,
      ),
      [FieldNameRevision.content]: userSlideContent,
      [FieldNameRevision.yjsStateVector]: null,
      [FieldNameRevision.noteType]: NoteType.SLIDE,
      [FieldNameRevision.title]: userSlideTitle,
      [FieldNameRevision.description]: userSlideDescription,
    },
  ]);
  await knex(TableRevisionTag).insert([
    ...guestNoteTags.map((tag) => ({
      [FieldNameRevisionTag.revisionId]: 1,
      [FieldNameRevisionTag.tag]: tag,
    })),
    ...userNoteTags.map((tag) => ({
      [FieldNameRevisionTag.revisionId]: 2,
      [FieldNameRevisionTag.tag]: tag,
    })),
    ...userSlideTags.map((tag) => ({
      [FieldNameRevisionTag.revisionId]: 3,
      [FieldNameRevisionTag.tag]: tag,
    })),
  ]);
  await knex(TableAuthorshipInfo).insert([
    {
      [FieldNameAuthorshipInfo.revisionId]: 1,
      [FieldNameAuthorshipInfo.authorId]: 1,
      [FieldNameAuthorshipInfo.startPosition]: 0,
      [FieldNameAuthorshipInfo.endPosition]: guestNoteContent.length,
    },
    {
      [FieldNameAuthorshipInfo.revisionId]: 2,
      [FieldNameAuthorshipInfo.authorId]: 2,
      [FieldNameAuthorshipInfo.startPosition]: 0,
      [FieldNameAuthorshipInfo.endPosition]: userNoteContent.length,
    },
    {
      [FieldNameAuthorshipInfo.revisionId]: 3,
      [FieldNameAuthorshipInfo.authorId]: 2,
      [FieldNameAuthorshipInfo.startPosition]: 0,
      [FieldNameAuthorshipInfo.endPosition]: userSlideContent.length,
    },
  ]);
  await knex(TableNoteGroupPermission).insert([
    {
      [FieldNameNoteGroupPermission.noteId]: 1,
      [FieldNameNoteGroupPermission.groupId]: 1,
      [FieldNameNoteGroupPermission.canEdit]: true,
    },
    {
      [FieldNameNoteGroupPermission.noteId]: 2,
      [FieldNameNoteGroupPermission.groupId]: 1,
      [FieldNameNoteGroupPermission.canEdit]: false,
    },
    {
      [FieldNameNoteGroupPermission.noteId]: 3,
      [FieldNameNoteGroupPermission.groupId]: 1,
      [FieldNameNoteGroupPermission.canEdit]: false,
    },
  ]);
  await knex(TableNoteUserPermission).insert([
    {
      [FieldNameNoteUserPermission.noteId]: 2,
      [FieldNameNoteUserPermission.userId]: 2,
      [FieldNameNoteUserPermission.canEdit]: true,
    },
    {
      [FieldNameNoteUserPermission.noteId]: 3,
      [FieldNameNoteUserPermission.userId]: 2,
      [FieldNameNoteUserPermission.canEdit]: true,
    },
  ]);
}
