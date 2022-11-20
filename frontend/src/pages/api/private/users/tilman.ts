/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { UserInfo } from '../../../../api/users/types'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<UserInfo>(HttpMethod.GET, req, res, {
    username: 'tilman',
    displayName: 'Tilman',
    photo: 'public/img/avatar.png'
  })
}

export default handler
