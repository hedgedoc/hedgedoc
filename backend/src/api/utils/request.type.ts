/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Request } from 'express';

import { Note } from '../../notes/note.entity';
import { SessionState } from '../../sessions/session.service';
import { User } from '../../users/user.entity';

export type CompleteRequest = Request & {
  user?: User;
  note?: Note;
  session?: SessionState;
};
