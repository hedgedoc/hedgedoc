/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UnitalicBoldContent } from '../unitalic-bold-content'
import React from 'react'
import { Trans } from 'react-i18next'

export interface UnitalicBoldTransProps {
  i18nKey?: string
}

export const UnitalicBoldTrans: React.FC<UnitalicBoldTransProps> = ({ i18nKey }) => {
  return (
    <UnitalicBoldContent>
      <Trans i18nKey={i18nKey} />
    </UnitalicBoldContent>
  )
}
