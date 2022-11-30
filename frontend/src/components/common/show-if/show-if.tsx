/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import React, { Fragment } from 'react'

export interface ShowIfProps {
  condition: boolean
}

/**
 * Renders the children if the condition is met.
 *
 * @param children The children to show if the condition is met.
 * @param condition If the children should be shown
 */
export const ShowIf: React.FC<PropsWithChildren<ShowIfProps>> = ({ children, condition }) => {
  return condition ? <Fragment>{children}</Fragment> : null
}
