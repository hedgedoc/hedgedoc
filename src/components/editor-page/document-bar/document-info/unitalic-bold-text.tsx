/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import type { PropsWithDataCypressId } from '../../../../utils/cypress-attribute'
import { cypressId } from '../../../../utils/cypress-attribute'

export interface UnitalicBoldTextProps extends PropsWithDataCypressId {
  text: string | number
}

export const UnitalicBoldText: React.FC<UnitalicBoldTextProps> = ({ text, ...props }) => {
  return (
    <b className={'font-style-normal mr-1'} {...cypressId(props)}>
      {text}
    </b>
  )
}
