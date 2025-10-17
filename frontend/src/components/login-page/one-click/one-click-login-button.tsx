/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AuthProviderInterface, AuthProviderWithCustomNameInterface } from '@hedgedoc/commons'
import { IconButton } from '../../common/icon-button/icon-button'
import React, { useMemo } from 'react'
import { getOneClickProviderMetadata } from './get-one-click-provider-metadata'

export interface ViaOneClickProps {
  provider: AuthProviderInterface
}

/**
 * Renders a login button for the given one-click login provider.
 *
 * @param provider The one-click login provider. In case of ones that can be defined multiple times, an identifier and a label is required.
 */
export const OneClickLoginButton: React.FC<ViaOneClickProps> = ({ provider }) => {
  const { className, icon, url, name } = useMemo(() => getOneClickProviderMetadata(provider), [provider])
  const text = (provider as AuthProviderWithCustomNameInterface).providerName || name

  return (
    <IconButton className={className} icon={icon} href={url} title={text} border={true}>
      {text}
    </IconButton>
  )
}
