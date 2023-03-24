/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { updateMetadata } from '../../../../../redux/note-details/methods'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect } from 'react'

/**
 * Hook that updates the metadata if the server announced an update of the metadata.
 *
 * @param websocketConnection The websocket connection that emits the metadata changed event
 */
export const useOnMetadataUpdated = (websocketConnection: MessageTransporter): void => {
  useEffect(() => {
    const listener = websocketConnection.on(MessageType.METADATA_UPDATED, () => void updateMetadata(), {
      objectify: true
    }) as Listener
    return () => {
      listener.off()
    }
  }, [websocketConnection])
}
