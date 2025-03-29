/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpMethod, respondToMatchingRequest } from '../../../handler-utils/respond-to-matching-request'
import { isMockMode, isTestMode } from '../../../utils/test-modes'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { MediaUploadDto } from '@hedgedoc/commons'

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (isMockMode && !isTestMode) {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000)
    })
  }

  respondToMatchingRequest<MediaUploadDto>(
    HttpMethod.POST,
    req,
    res,
    {
      uuid: 'e81f57cd-5866-4253-9f57-cd5866a253ca',
      fileName: 'avatar.png',
      noteId: null,
      username: 'test',
      createdAt: '2022-02-27T21:54:23.856Z'
    },
    201
  )
}

export default handler
