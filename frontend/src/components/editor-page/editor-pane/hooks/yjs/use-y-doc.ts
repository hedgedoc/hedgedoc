/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MessageTransporter } from '@hedgedoc/commons'
import { useEffect, useState } from 'react'
import { Doc } from 'yjs'

/**
 * Creates a new {@link Doc y-doc}.
 *
 * @return The created {@link Doc y-doc}
 */
export const useYDoc = (messageTransporter: MessageTransporter): Doc | undefined => {
  const [yDoc, setYDoc] = useState<Doc>()

  useEffect(() => {
    messageTransporter.on('connected', () => {
      setYDoc(new Doc())
    })
    messageTransporter.on('disconnected', () => {
      setYDoc(undefined)
    })
  }, [messageTransporter])

  useEffect(() => () => yDoc?.destroy(), [yDoc])

  return yDoc
}
