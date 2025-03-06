/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Request } from 'express';

import { User } from '../../database/user.entity';
import { Note } from '../../notes/note.entity';
import { SessionState } from '../../sessions/session.service';

export type CompleteRequest = Request & {
  user?: User;
  note?: Note;
  session?: SessionState;
};
