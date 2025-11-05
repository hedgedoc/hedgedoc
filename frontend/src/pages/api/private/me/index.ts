/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { LoginUserInfoInterface } from '@hedgedoc/commons'
import { AuthProviderType } from '@hedgedoc/commons'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  const cookieSet = req.headers?.['cookie']?.split(';').find((value) => value.trim() === 'mock-session=1') !== undefined
  if (!cookieSet) {
    res.status(403).json({})
    return
  }
  respondToMatchingRequest<LoginUserInfoInterface>(HttpMethod.GET, req, res, {
    username: 'mock',
    photoUrl: '/public/img/avatar.png',
    displayName: 'Mock User',
    authProvider: AuthProviderType.LOCAL,
    email: 'mock@hedgedoc.test'
  })
}

export default handler
