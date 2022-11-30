/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { addOnlineUser, removeOnlineUser } from '../../../../../redux/realtime/methods'
import { ActiveIndicatorStatus } from '../../../../../redux/realtime/types'
import { Logger } from '../../../../../utils/logger'
import { useEffect, useMemo } from 'react'
import { Awareness } from 'y-protocols/awareness'
import type { Doc } from 'yjs'

const ownAwarenessClientId = -1

interface UserAwarenessState {
  user: {
    name: string
    color: string
  }
}

// TODO: [mrdrogdrog] move this code to the server for the initial color setting.
const userColors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' }
]

const logger = new Logger('useAwareness')

/**
 * Creates an {@link Awareness awareness}, sets the own values (like name, color, etc.) for other clients and writes state changes into the global application state.
 *
 * @param yDoc The {@link Doc yjs document} that handles the communication.
 * @return The created {@link Awareness awareness}
 */
export const useAwareness = (yDoc: Doc): Awareness => {
  const ownUsername = useApplicationState((state) => state.user?.username)
  const awareness = useMemo(() => new Awareness(yDoc), [yDoc])

  useEffect(() => {
    const userColor = userColors[Math.floor(Math.random() * 8)]
    if (ownUsername !== undefined) {
      awareness.setLocalStateField('user', {
        name: ownUsername,
        color: userColor.color,
        colorLight: userColor.light
      })
      addOnlineUser(ownAwarenessClientId, {
        active: ActiveIndicatorStatus.ACTIVE,
        color: userColor.color,
        username: ownUsername
      })
    }

    const awarenessCallback = ({ added, removed }: { added: number[]; removed: number[] }): void => {
      added.forEach((addedId) => {
        const state = awareness.getStates().get(addedId) as UserAwarenessState | undefined
        if (!state) {
          logger.debug('Could not find state for user')
          return
        }
        logger.debug(`added awareness ${addedId}`, state.user)
        addOnlineUser(addedId, {
          active: ActiveIndicatorStatus.ACTIVE,
          color: state.user.color,
          username: state.user.name
        })
      })
      removed.forEach((removedId) => {
        logger.debug(`remove awareness ${removedId}`)
        removeOnlineUser(removedId)
      })
    }
    awareness.on('change', awarenessCallback)

    return () => {
      awareness.off('change', awarenessCallback)
      removeOnlineUser(ownAwarenessClientId)
    }
  }, [awareness, ownUsername])
  return awareness
}
