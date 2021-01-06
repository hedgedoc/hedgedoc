/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { LoginProvider } from '../../redux/user/types'

export interface UserResponse {
  id: string
  name: string
  photo: string
  provider: LoginProvider
}
