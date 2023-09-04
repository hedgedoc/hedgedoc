/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useAsync } from 'react-use'
import { fetchMotd, MOTD_LOCAL_STORAGE_KEY_LAST_MODIFIED } from './fetch-motd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Logger } from '../../../utils/logger'

const logger = new Logger('Motd')

/**
 * Fetches the motd message.
 * Provides the message, the dismissal state and an option to dismiss the modal.
 * The dismissal option will result in the "last modified" identifier being written into the local storage
 * to indicate that the modal does not need to be shown again unless the motd message changes.
 */
export const useMotdMessage = () => {
  const { error, loading, value } = useAsync(fetchMotd)
  const messageLines = useMemo(() => value?.motdText.split('\n'), [value])
  const [dismissTriggered, setDismissTriggered] = useState(false)
  const isMessageSet = useMemo(() => {
    return !loading && !error && !!value?.motdText
  }, [loading, error, value])

  const isDismissed = useMemo(() => {
    if (dismissTriggered) {
      return true
    }
    const lastModified = window.localStorage.getItem(MOTD_LOCAL_STORAGE_KEY_LAST_MODIFIED)
    return lastModified === value?.lastModified
  }, [value, dismissTriggered])

  const dismissMotd = useCallback(() => {
    logger.debug('Dismissed motd with last modified value:', value?.lastModified)
    if (value?.lastModified) {
      window.localStorage.setItem(MOTD_LOCAL_STORAGE_KEY_LAST_MODIFIED, value.lastModified)
    }
    setDismissTriggered(true)
  }, [value, setDismissTriggered])

  useEffect(() => {
    if (error) {
      logger.error('Error while fetching motd', error)
    }
  }, [error])

  return {
    isMessageSet,
    messageLines,
    isDismissed,
    dismissMotd
  }
}
