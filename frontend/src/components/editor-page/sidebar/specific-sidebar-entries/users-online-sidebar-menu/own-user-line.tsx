/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { UserLine } from './user-line/user-line'
import React from 'react'

/**
 * Renders the users own {@link UserLine userline}.
 */
export const OwnUserLine: React.FC = () => {
  const ownUsername = useApplicationState((state) => state.user?.username ?? null)
  const ownDisplayname = useApplicationState((state) => state.realtimeStatus.ownUser.displayName)
  const ownStyleIndex = useApplicationState((state) => state.realtimeStatus.ownUser.styleIndex)

  return (
    <SidebarButton>
      <UserLine displayName={ownDisplayname} username={ownUsername} color={ownStyleIndex} active={true} own={true} />
    </SidebarButton>
  )
}
