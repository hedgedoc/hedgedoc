/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RevisionMetadataDto } from '@hedgedoc/commons'
import { HttpMethod, respondToMatchingRequest } from '../../../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<RevisionMetadataDto[]>(HttpMethod.GET, req, res, [
    {
      id: 1,
      createdAt: '2021-12-29T17:54:11.000Z',
      length: 2788,
      authorUsernames: [],
      anonymousAuthorCount: 4,
      title: 'Features',
      description: 'Many features, such wow!',
      tags: ['hedgedoc', 'demo', 'react']
    },
    {
      id: 0,
      createdAt: '2021-12-21T16:59:42.000Z',
      length: 2782,
      authorUsernames: [],
      anonymousAuthorCount: 2,
      title: 'Features',
      description: 'Many more features, such wow!',
      tags: ['hedgedoc', 'demo', 'react']
    }
  ])
}

export default handler
