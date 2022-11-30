/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { GroupInfo } from '../../../../api/group/types'
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  respondToMatchingRequest<GroupInfo>(HttpMethod.GET, req, res, {
    name: 'hedgedoc-devs',
    displayName: 'HedgeDoc devs',
    special: true
  })
}

export default handler
