/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { MediaUploadDto } from '@hedgedoc/commons'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  respondToMatchingRequest<MediaUploadDto[]>(HttpMethod.GET, req, res, [
    {
      username: 'tilman',
      createdAt: '2022-03-20T20:36:32Z',
      uuid: '5355ed83-7e12-4db0-95ed-837e124db08c',
      fileName: 'dummy.png',
      noteId: 'features'
    },
    {
      username: 'tilman',
      createdAt: '2022-03-20T20:36:57+0000',
      uuid: '656745ab-fbf9-47f1-a745-abfbf9a7f10c',
      fileName: 'dummy2.png',
      noteId: null
    }
  ])
}

export default handler
