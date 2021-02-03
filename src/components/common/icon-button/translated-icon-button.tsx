/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Trans } from 'react-i18next'
import { IconButton, IconButtonProps } from './icon-button'

export interface TranslatedIconButtonProps extends IconButtonProps {
  i18nKey: string
}

export const TranslatedIconButton: React.FC<TranslatedIconButtonProps> = ({ i18nKey, ...props }) => {
  return (
    <IconButton { ...props }>
      <Trans i18nKey={ i18nKey }/>
    </IconButton>
  )
}
