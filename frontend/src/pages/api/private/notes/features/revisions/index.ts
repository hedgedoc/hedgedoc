/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RevisionMetadata } from '../../../../../../api/revisions/types'
import { HttpMethod, respondToMatchingRequest } from '../../../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<RevisionMetadata[]>(HttpMethod.GET, req, res, [
    {
      id: 1,
      createdAt: '2021-12-29T17:54:11.000Z',
      length: 2788,
      authorUsernames: [],
      anonymousAuthorCount: 4
    },
    {
      id: 0,
      createdAt: '2021-12-21T16:59:42.000Z',
      length: 2782,
      authorUsernames: [],
      anonymousAuthorCount: 2
    }
  ])
}

export default handler
