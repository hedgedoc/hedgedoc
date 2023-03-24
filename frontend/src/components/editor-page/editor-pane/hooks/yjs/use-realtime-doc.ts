/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RealtimeDoc } from '@hedgedoc/commons'
import { useEffect, useMemo } from 'react'

/**
 * Creates a new {@link RealtimeDoc y-doc}.
 *
 * @return The created {@link RealtimeDoc y-doc}
 */
export const useRealtimeDoc = (): RealtimeDoc => {
  const doc = useMemo(() => new RealtimeDoc(), [])

  useEffect(() => () => doc.destroy(), [doc])

  return doc
}
