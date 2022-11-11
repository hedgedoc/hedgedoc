/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { Note } from '../../../../api/notes/types'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<Note>(
    HttpMethod.POST,
    req,
    res,
    {
      content: 'new note content',
      metadata: {
        id: 'featuresId',
        version: 2,
        viewCount: 0,
        updatedAt: '2021-04-24T09:27:51.000Z',
        createdAt: '2021-04-24T09:27:51.000Z',
        updateUsername: null,
        primaryAddress: 'features',
        editedBy: [],
        title: 'New note',
        tags: ['hedgedoc', 'demo', 'react'],
        description: 'Many features, such wow!',
        aliases: [
          {
            name: 'features',
            primaryAlias: true,
            noteId: 'featuresId'
          }
        ],
        permissions: {
          owner: 'tilman',
          sharedToUsers: [
            {
              username: 'molly',
              canEdit: true
            }
          ],
          sharedToGroups: [
            {
              groupName: '_LOGGED_IN',
              canEdit: false
            }
          ]
        }
      },
      editedByAtPosition: []
    },
    201
  )
}

export default handler
