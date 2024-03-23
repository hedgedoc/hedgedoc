/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Set-Cookie', 'mock-session=0; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT').status(200).json({
    redirect: '/'
  })
}

export default handler
