/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useMemo } from 'react'
import { Doc } from 'yjs'

/**
 * Creates a new {@link Doc y-doc}.
 *
 * @return The created {@link Doc y-doc}
 */
export const useYDoc = (): Doc => {
  const yDoc = useMemo(() => new Doc(), [])
  useEffect(() => () => yDoc.destroy(), [yDoc])
  return yDoc
}
