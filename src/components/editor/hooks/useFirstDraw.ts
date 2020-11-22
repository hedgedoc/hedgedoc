/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react'

export const useFirstDraw = ():boolean => {
  const [firstDraw, setFirstDraw] = useState(true)

  useEffect(() => {
    setFirstDraw(false)
  }, [])

  return firstDraw
}
