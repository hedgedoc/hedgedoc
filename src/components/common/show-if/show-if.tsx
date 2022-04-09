/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { Fragment } from 'react'

export interface ShowIfProps {
  condition: boolean
}

export const ShowIf: React.FC<PropsWithChildren<ShowIfProps>> = ({ children, condition }) => {
  return condition ? <Fragment>{children}</Fragment> : null
}
