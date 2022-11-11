/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod, respondToMatchingRequest } from '../../../../handler-utils/respond-to-matching-request'
import type { Alias, NewAliasDto } from '../../../../api/alias/types'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  respondToMatchingRequest<Alias>(
    HttpMethod.POST,
    req,
    res,
    {
      name: (req.body as NewAliasDto).newAlias,
      noteId: (req.body as NewAliasDto).noteIdOrAlias,
      primaryAlias: false
    },
    201
  )
}

export default handler
