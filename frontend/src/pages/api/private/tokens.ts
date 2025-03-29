/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpMethod, respondToMatchingRequest } from '../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { ApiTokenDto } from '@hedgedoc/commons'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  respondToMatchingRequest<ApiTokenDto[]>(HttpMethod.GET, req, res, [
    {
      label: 'Demo-App',
      keyId: 'demo',
      createdAt: '2021-11-20T23:54:13+01:00',
      lastUsedAt: '2021-11-20T23:54:13+01:00',
      validUntil: '2022-11-20'
    },
    {
      label: 'CLI @ Test-PC',
      keyId: 'cli',
      createdAt: '2021-11-20T23:54:13+01:00',
      lastUsedAt: '2021-11-20T23:54:13+01:00',
      validUntil: '2021-11-20'
    }
  ])
}

export default handler
