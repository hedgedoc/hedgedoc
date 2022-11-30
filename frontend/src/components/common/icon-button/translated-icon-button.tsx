/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { IconButtonProps } from './icon-button'
import { IconButton } from './icon-button'
import React from 'react'
import { Trans } from 'react-i18next'

export interface TranslatedIconButtonProps extends IconButtonProps {
  i18nKey: string
}

/**
 * Renders an {@link IconButton icon button} with a translation inside.
 *
 * @param i18nKey The key for the translated string.
 * @param props Additional props directly given to the {@link IconButton}.
 */
export const TranslatedIconButton: React.FC<TranslatedIconButtonProps> = ({ i18nKey, ...props }) => {
  return (
    <IconButton {...props}>
      <Trans i18nKey={i18nKey} />
    </IconButton>
  )
}
