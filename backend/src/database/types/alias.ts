/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * An alias is a unique identifier for a {@link Note}, making the note accessible under /n/<alias>.
 * A note can have unlimited user-defined aliases.
 * The primary alias is the one used in URLs generated by HedgeDoc.
 * For each note, there can only be one primary alias.
 */
export interface Alias {
  /** The alias as defined by the user. Is unique.  */
  [FieldNameAlias.alias]: string;

  /** The id of the associated {@link Note}. */
  [FieldNameAlias.noteId]: number;

  /** Whether the alias is the primary one for the note. */
  [FieldNameAlias.isPrimary]: boolean;
}

export enum FieldNameAlias {
  alias = 'alias',
  noteId = 'note_id',
  isPrimary = 'is_primary',
}

export const TableAlias = 'alias';

export type TypeInsertAlias = Alias;
export type TypeUpdateAlias = Pick<Alias, FieldNameAlias.isPrimary>;
