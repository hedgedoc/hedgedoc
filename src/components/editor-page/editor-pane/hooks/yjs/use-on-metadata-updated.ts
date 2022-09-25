/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { YDocMessageTransporter } from '@hedgedoc/realtime'
import { MessageType } from '@hedgedoc/realtime'
import { updateMetadata } from '../../../../../redux/note-details/methods'
import { useCallback, useEffect } from 'react'

/**
 * Hook that updates the metadata if the server announced an update of the metadata.
 *
 * @param websocketConnection The websocket connection that emits the metadata changed event
 */
export const useOnMetadataUpdated = (websocketConnection: YDocMessageTransporter): void => {
  const updateMetadataHandler = useCallback(async () => {
    await updateMetadata()
  }, [])

  useEffect(() => {
    websocketConnection.on(MessageType.METADATA_UPDATED, updateMetadataHandler)
    return () => {
      websocketConnection.off(MessageType.METADATA_UPDATED, updateMetadataHandler)
    }
  })
}
