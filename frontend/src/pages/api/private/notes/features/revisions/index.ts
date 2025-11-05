/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RevisionMetadataInterface } from '@hedgedoc/commons'
import { HttpMethod, respondToMatchingRequest } from '../../../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<RevisionMetadataInterface[]>(HttpMethod.GET, req, res, [
    {
      uuid: '019a5647-fc18-7e2d-9d8d-867be8a5ef28',
      createdAt: '2021-12-29T17:54:11.000Z',
      length: 2788,
      authorUsernames: [],
      authorGuestUuids: ['1', '2', '3'],
      title: 'Features',
      description: 'Many features, such wow!',
      tags: ['hedgedoc', 'demo', 'react']
    },
    {
      uuid: '019a5648-4986-7213-9067-a4a6859171c5',
      createdAt: '2021-12-21T16:59:42.000Z',
      length: 2782,
      authorUsernames: [],
      authorGuestUuids: ['1', '2', '3'],
      title: 'Features',
      description: 'Many more features, such wow!',
      tags: ['hedgedoc', 'demo', 'react']
    }
  ])
}

export default handler
