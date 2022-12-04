/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { updateMetadata } from '../../../../../redux/note-details/methods'
import type { YDocMessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
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
    websocketConnection.on(String(MessageType.METADATA_UPDATED), () => void updateMetadataHandler())
    return () => {
      websocketConnection.off(String(MessageType.METADATA_UPDATED), () => void updateMetadataHandler())
    }
  })
}
