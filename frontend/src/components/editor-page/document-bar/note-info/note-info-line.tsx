/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import type { IconName } from '../../../common/fork-awesome/types'
import type { PropsWithChildren } from 'react'
import React from 'react'

export interface NoteInfoLineProps {
  icon: IconName
  size?: '2x' | '3x' | '4x' | '5x' | undefined
}

/**
 * This is the base component for all note info lines.
 * It renders an icon and some children in italic.
 *
 * @param icon The icon be shown
 * @param size Which size the icon should be
 * @param children The children to render
 */
export const NoteInfoLine: React.FC<PropsWithChildren<NoteInfoLineProps>> = ({ icon, size, children }) => {
  return (
    <span className={'d-flex align-items-center'}>
      <ForkAwesomeIcon icon={icon} size={size} fixedWidth={true} className={'mx-2'} />
      <i className={'d-flex align-items-center'}>{children}</i>
    </span>
  )
}
