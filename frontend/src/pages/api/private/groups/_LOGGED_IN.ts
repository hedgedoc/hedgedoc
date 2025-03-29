/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { GroupInfoDto } from '@hedgedoc/commons'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  respondToMatchingRequest<GroupInfoDto>(HttpMethod.GET, req, res, {
    name: '_LOGGED_IN',
    displayName: 'All registered users',
    special: true
  })
}

export default handler
