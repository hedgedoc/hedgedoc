/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Request } from 'express';

import { FieldNameNote, FieldNameUser, Note, User } from '../../database/types';
import { SessionState } from '../../sessions/session.service';

export type CompleteRequest = Request & {
  userId?: User[FieldNameUser.id];
  noteId?: Note[FieldNameNote.id];
  session?: SessionState;
};
