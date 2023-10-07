/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { UserInfo } from '../../../../api/users/types'
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<UserInfo>(HttpMethod.GET, req, res, {
    username: 'molly',
    displayName: 'Molly',
    photoUrl: '/public/img/avatar.png'
  })
}

export default handler
