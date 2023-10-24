'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react'
import { useMotdContextValue } from '../../motd/motd-context'
import { useLocalStorage } from 'react-use'
import { MotdModal } from './motd-modal'
import { testId } from '../../../utils/test-id'
import { isTestMode } from '../../../utils/test-modes'
import { IGNORE_MOTD, MOTD_LOCAL_STORAGE_KEY } from './local-storage-keys'

/**
 * Reads the motd from the context and shows it in a modal.
 * If the modal gets dismissed by the user then the "last modified" identifier will be written into the local storage
 * to prevent that the motd will be shown again until it gets changed.
 */
export const CachedMotdModal: React.FC = () => {
  const contextValue = useMotdContextValue()
  const [cachedLastModified, saveLocalStorage] = useLocalStorage<string>(MOTD_LOCAL_STORAGE_KEY, undefined, {
    raw: true
  })

  const [dismissed, setDismissed] = useState(false)

  const show = useMemo(() => {
    const lastModified = contextValue?.lastModified

    if (cachedLastModified === IGNORE_MOTD && isTestMode) {
      return false
    }
    if (cachedLastModified === lastModified || lastModified === undefined) {
      return false
    }
    return !dismissed
  }, [cachedLastModified, contextValue?.lastModified, dismissed])

  const doDismiss = useCallback(() => {
    const lastModified = contextValue?.lastModified
    if (lastModified) {
      saveLocalStorage(lastModified)
    }
    setDismissed(true)
  }, [contextValue, saveLocalStorage])

  if (contextValue?.lastModified === undefined && process.env.NODE_ENV === 'test') {
    return <span {...testId('loaded not visible')} />
  }

  return <MotdModal show={show} onDismiss={doDismiss}></MotdModal>
}
