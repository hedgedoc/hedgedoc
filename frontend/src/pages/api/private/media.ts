/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MediaUpload } from '../../../api/media/types'
import { HttpMethod, respondToMatchingRequest } from '../../../handler-utils/respond-to-matching-request'
import { isMockMode, isTestMode } from '../../../utils/test-modes'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (isMockMode && !isTestMode) {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000)
    })
  }

  respondToMatchingRequest<MediaUpload>(
    HttpMethod.POST,
    req,
    res,
    {
      url: '/public/img/avatar.png',
      noteId: null,
      username: 'test',
      createdAt: '2022-02-27T21:54:23.856Z'
    },
    201
  )
}

export default handler
