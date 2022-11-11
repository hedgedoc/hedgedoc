/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { GroupInfo } from '../../../../api/group/types'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  respondToMatchingRequest<GroupInfo>(HttpMethod.GET, req, res, {
    name: '_LOGGED_IN',
    displayName: 'All registered users',
    special: true
  })
}

export default handler
