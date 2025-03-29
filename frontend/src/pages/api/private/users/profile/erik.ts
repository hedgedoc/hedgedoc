/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { UserInfoDto } from '@hedgedoc/commons'
import { HttpMethod, respondToMatchingRequest } from '../../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<UserInfoDto>(HttpMethod.GET, req, res, {
    username: 'erik',
    displayName: 'Erik',
    photoUrl: '/public/img/avatar.png'
  })
}

export default handler
