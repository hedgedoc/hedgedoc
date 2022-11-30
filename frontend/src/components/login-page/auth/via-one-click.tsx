/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AuthProvider, AuthProviderWithCustomName } from '../../../api/config/types'
import { SocialLinkButton } from './social-link-button/social-link-button'
import { getOneClickProviderMetadata } from './utils/get-one-click-provider-metadata'
import React, { useMemo } from 'react'

export interface ViaOneClickProps {
  provider: AuthProvider
}

/**
 * Renders a login button for the given one-click login provider.
 *
 * @param provider The one-click login provider. In case of ones that can be defined multiple times, an identifier and a label is required.
 */
export const ViaOneClick: React.FC<ViaOneClickProps> = ({ provider }) => {
  const { className, icon, url, name } = useMemo(() => getOneClickProviderMetadata(provider), [provider])
  const text = (provider as AuthProviderWithCustomName).providerName || name

  return (
    <SocialLinkButton backgroundClass={className} icon={icon} href={url} title={text}>
      {text}
    </SocialLinkButton>
  )
}
