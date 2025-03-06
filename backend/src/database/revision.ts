/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteType } from '@hedgedoc/commons';

/**
 * A revision represents the content of a {@link Note} at a specific point in time.
 */
export interface Revision {
  /** The unique id of the revision for internal referencing */
  id: number;

  /** The id of the note that this revision belongs to */
  noteId: number;

  /** The changes between this revision and the previous one in patch file format */
  patch: string;

  /** The content of the note at this revision */
  content: string;

  /** The stored Y.js state for realtime editing */
  yjsStateVector: null | ArrayBuffer;

  /** Whether the note is a document or presentation at this revision */
  noteType: NoteType;

  /** The extracted note title from this revision */
  title: string;

  /** The extracted description from this revision */
  description: string;

  /** Timestamp when this revision was created */
  createdAt: Date;
}
