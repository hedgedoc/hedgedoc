/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MessageTransporter } from '@hedgedoc/commons'
import { RealtimeDoc } from '@hedgedoc/commons'
import { useEffect, useState } from 'react'

/**
 * Creates a new {@link RealtimeDoc y-doc}.
 *
 * @return The created {@link RealtimeDoc y-doc}
 */
export const useYDoc = (messageTransporter: MessageTransporter): RealtimeDoc | undefined => {
  const [yDoc, setYDoc] = useState<RealtimeDoc>()

  useEffect(() => {
    messageTransporter.doAsSoonAsConnected(() => {
      setYDoc(new RealtimeDoc())
    })
    messageTransporter.on('disconnected', () => {
      setYDoc(undefined)
    })
  }, [messageTransporter])

  useEffect(() => () => yDoc?.destroy(), [yDoc])

  return yDoc
}
