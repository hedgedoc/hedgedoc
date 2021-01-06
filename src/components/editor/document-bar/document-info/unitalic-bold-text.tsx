/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'

export interface UnitalicBoldTextProps {
  text: string ;
}

export const UnitalicBoldText: React.FC<UnitalicBoldTextProps> = ({ text }) => {
  return <b className={'font-style-normal mr-1'}>{text}</b>
}
