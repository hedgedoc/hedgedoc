/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { YDocMessageTransporter } from '@hedgedoc/commons'
import { useEffect, useState } from 'react'

/**
 * Checks if the given message transporter has received at least one full synchronisation.
 *
 * @param connection The connection whose sync status should be checked
 * @return If at least one full synchronisation is occurred.
 */
export const useIsConnectionSynced = (connection: YDocMessageTransporter): boolean => {
  const [editorEnabled, setEditorEnabled] = useState<boolean>(false)

  useEffect(() => {
    const enableEditor = () => setEditorEnabled(true)
    const disableEditor = () => setEditorEnabled(false)
    connection.on('synced', enableEditor)
    connection.on('disconnected', disableEditor)
    return () => {
      connection.off('synced', enableEditor)
      connection.off('disconnected', disableEditor)
    }
  }, [connection])

  return editorEnabled
}
