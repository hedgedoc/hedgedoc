/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconButton } from '../../../common/icon-button/icon-button'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { CloudDownload as IconPull, CloudUpload as IconPush } from 'react-bootstrap-icons'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { cypressId } from '../../../../utils/cypress-attribute'
import { useOutlineButtonVariant } from '../../../../hooks/dark-mode/use-outline-button-variant'

/**
 * Renders quick actions for GitHub sync (Pull/Push) into the app bar.
 *
 * Buttons are enabled only if both a token and a note-level sync target exist in localStorage.
 * Actual sync behavior will be implemented later.
 */
export const GithubSyncQuickActions: React.FC = () => {
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const [hasToken, setHasToken] = useState(false)
  const [hasTarget, setHasTarget] = useState(false)
  const { dispatchUiNotification } = useUiNotifications()
  const buttonVariant = useOutlineButtonVariant()

  const targetStorageKey = useMemo(() => {
    const key = noteId ? `hd2.sync.github.target.${noteId}` : null
    console.log('GitHub Sync Quick Actions - noteId:', noteId, 'targetStorageKey:', key)
    return key
  }, [noteId])

  useEffect(() => {
    const refresh = () => {
      try {
        // First check localStorage (backward compatibility)
        const tokenRaw = window.localStorage.getItem('hd2.sync.github.token')
        if (tokenRaw) {
          setHasToken(true)
          return
        }
        
        // If not in localStorage, try to fetch from backend API
        fetch('/api/private/me/github-token', {
          credentials: 'include'
        })
          .then(response => {
            if (response.ok) {
              return response.json()
            }
            throw new Error('Failed to fetch token')
          })
          .then((data: { hasToken: boolean; token?: string }) => {
            if (data.hasToken && data.token) {
              // Store in localStorage for the sync functionality to use
              window.localStorage.setItem(
                'hd2.sync.github.token',
                JSON.stringify({
                  token: data.token,
                  source: 'oauth',
                  savedAt: new Date().toISOString()
                })
              )
              setHasToken(true)
            } else {
              setHasToken(false)
            }
          })
          .catch(() => {
            setHasToken(false)
          })
      } catch {
        setHasToken(false)
      }
    }
    refresh()
    const onCustom = () => refresh()
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith('hd2.sync.github')) {
        refresh()
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }
    window.addEventListener('hd2.sync.github.updated', onCustom as EventListener)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('hd2.sync.github.updated', onCustom as EventListener)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (!targetStorageKey) {
      setHasTarget(false)
      return
    }
    
    const checkTarget = () => {
      try {
        const targetRaw = window.localStorage.getItem(targetStorageKey)
        console.log('GitHub Sync Quick Actions - checking target:', targetStorageKey, 'found:', !!targetRaw, 'value:', targetRaw)
        setHasTarget(!!targetRaw)
      } catch {
        setHasTarget(false)
      }
    }
    
    checkTarget()
    
    // Listen for updates to the target
    const onCustom = () => checkTarget()
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === targetStorageKey || e.key.startsWith('hd2.sync.github')) {
        checkTarget()
      }
    }
    
    window.addEventListener('hd2.sync.github.updated', onCustom as EventListener)
    window.addEventListener('storage', onStorage)
    
    return () => {
      window.removeEventListener('hd2.sync.github.updated', onCustom as EventListener)
      window.removeEventListener('storage', onStorage)
    }
  }, [targetStorageKey])

  const enabled = !!noteId && hasToken

  const onPull = (): void => {
    if (!hasTarget) {
      dispatchUiNotification('notifications.info.title', 'notifications.sync.configureTargetFirst', {
        durationInSecond: 6
      })
      return
    }
    window.dispatchEvent(new CustomEvent('hd2.sync.github.pull'))
  }

  const onPush = (): void => {
    if (!hasTarget) {
      dispatchUiNotification('notifications.info.title', 'notifications.sync.configureTargetFirst', {
        durationInSecond: 6
      })
      return
    }
    window.dispatchEvent(new CustomEvent('hd2.sync.github.push'))
  }

  return (
    <Fragment>
      <IconButton
        {...cypressId('github-sync-pull')}
        size={'sm'}
        variant={buttonVariant}
        icon={IconPull}
        disabled={!enabled}
        onClick={onPull}
        title={'Pull from GitHub'}
      />
      <IconButton
        {...cypressId('github-sync-push')}
        size={'sm'}
        variant={buttonVariant}
        icon={IconPush}
        disabled={!enabled}
        onClick={onPush}
        title={'Push to GitHub'}
      />
    </Fragment>
  )
}


