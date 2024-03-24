/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MediaUpload } from '../../../../api/media/types'
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  respondToMatchingRequest<MediaUpload[]>(HttpMethod.GET, req, res, [
    {
      username: 'tilman',
      createdAt: '2022-03-20T20:36:32Z',
      id: 'dummy.png',
      noteId: 'features'
    },
    {
      username: 'tilman',
      createdAt: '2022-03-20T20:36:57+0000',
      id: 'dummy.png',
      noteId: null
    }
  ])
}

export default handler
