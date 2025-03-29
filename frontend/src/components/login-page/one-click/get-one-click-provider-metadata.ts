/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Icon } from 'react-bootstrap-icons'
import {
  Exclamation as IconExclamation,
  Github as IconGithub,
  Google as IconGoogle,
  PersonRolodex as IconPersonRolodex,
  Microsoft as IconMicrosoft,
  Paypal as IconPaypal,
  Discord as IconDiscord,
  Facebook as IconFacebook,
  Mastodon as IconMastodon
} from 'react-bootstrap-icons'
import { Logger } from '../../../utils/logger'
import type { AuthProviderDto } from '@hedgedoc/commons'
import { ProviderType } from '@hedgedoc/commons'
import { IconGitlab } from '../../common/icons/additional/icon-gitlab'
import styles from './one-click-login-button.module.scss'

export interface OneClickMetadata {
  name: string
  icon: Icon
  className: string
  url: string
}

const logger = new Logger('GetOneClickProviderMetadata')

/**
 * Returns metadata about the given one-click provider for rendering a relevant login button.
 *
 * @param provider The provider for which to retrieve the metadata.
 * @return Name, icon, URL and CSS class of the given provider for rendering a login button.
 */
export const getOneClickProviderMetadata = (provider: AuthProviderDto): OneClickMetadata => {
  if (provider.type !== ProviderType.OIDC) {
    logger.warn('Metadata for one-click-provider does not exist', provider)
    return {
      name: '',
      icon: IconExclamation,
      className: '',
      url: '#'
    }
  }
  let icon: Icon = IconPersonRolodex
  let className: string = 'btn-primary'
  switch (provider.theme) {
    case 'github':
      className = styles.github
      icon = IconGithub
      break
    case 'google':
      className = styles.google
      icon = IconGoogle
      break
    case 'gitlab':
      className = styles.gitlab
      icon = IconGitlab
      break
    case 'facebook':
      className = styles.facebook
      icon = IconFacebook
      break
    case 'mastodon':
      className = styles.mastodon
      icon = IconMastodon
      break
    case 'discord':
      className = styles.discord
      icon = IconDiscord
      break
    case 'paypal':
      className = styles.paypal
      icon = IconPaypal
      break
    case 'azure':
    case 'microsoft':
    case 'outlook':
      className = styles.azure
      icon = IconMicrosoft
      break
  }
  return {
    name: provider.providerName,
    icon,
    className,
    url: `/api/private/auth/oidc/${provider.identifier}`
  }
}
