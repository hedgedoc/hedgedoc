/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import type { IconName } from '../../../common/fork-awesome/types'

export interface DocumentInfoLineProps {
  icon: IconName
  size?: '2x' | '3x' | '4x' | '5x' | undefined
}

export const DocumentInfoLine: React.FC<DocumentInfoLineProps> = ({ icon, size, children }) => {
  return (
    <span className={'d-flex align-items-center'}>
      <ForkAwesomeIcon icon={icon} size={size} fixedWidth={true} className={'mx-2'} />
      <i className={'d-flex align-items-center'}>{children}</i>
    </span>
  )
}
