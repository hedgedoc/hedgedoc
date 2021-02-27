/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { User} from '../../src/users/user.entity';

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
