/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameNote, FieldNameUser, Note, User } from '@hedgedoc/database';
import { Request } from 'express';
import { SessionState } from 'src/sessions/session-state.type';

export type CompleteRequest = Request & {
  userId?: User[FieldNameUser.id];
  authProviderType?: AuthProviderType;
  noteId?: Note[FieldNameNote.id];
  session?: SessionState;
};

export type RequestWithSession = Request & {
  session: SessionState;
};
