/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../../common/icons/ui-icon'
import type { PropsWithChildren } from 'react'
import React from 'react'
import type { Icon } from 'react-bootstrap-icons'

export interface NoteInfoLineProps {
  icon: Icon
  size?: 2 | 3 | 4 | 5 | undefined
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
      <UiIcon icon={icon} size={size} className={'mx-2'} />
      <i className={'d-flex align-items-center'}>{children}</i>
    </span>
  )
}
