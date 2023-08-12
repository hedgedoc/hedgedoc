/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { LoginUserInfo } from '../../../../api/me/types'
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<LoginUserInfo>(HttpMethod.GET, req, res, {
    username: 'mock',
    photo: '/public/img/avatar.png',
    displayName: 'Mock User',
    authProvider: 'local',
    email: 'mock@hedgedoc.test'
  })
}

export default handler
