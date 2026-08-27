/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { LinkedIdentityInterface } from '@hedgedoc/commons'
import { AuthProviderType } from '@hedgedoc/commons'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<LinkedIdentityInterface[]>(HttpMethod.GET, req, res, [
    {
      providerType: AuthProviderType.LOCAL,
      providerIdentifier: null,
      createdAt: '2026-08-25T12:00:00.000Z'
    }
  ])
}

export default handler
