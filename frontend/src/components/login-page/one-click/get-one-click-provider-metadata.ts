/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './via-one-click.module.scss'
import type { Icon } from 'react-bootstrap-icons'
import {
  Exclamation as IconExclamation,
  Github as IconGithub,
  Google as IconGoogle,
  People as IconPeople,
  PersonRolodex as IconPersonRolodex
} from 'react-bootstrap-icons'
import { Logger } from '../../../utils/logger'
import type { AuthProvider } from '../../../api/config/types'
import { AuthProviderType } from '../../../api/config/types'
import { IconGitlab } from '../../common/icons/additional/icon-gitlab'

export interface OneClickMetadata {
  name: string
  icon: Icon
  className: string
  url: string
}

const getBackendAuthUrl = (providerIdentifer: string): string => {
  return `/auth/${providerIdentifer}`
}

const logger = new Logger('GetOneClickProviderMetadata')

/**
 * Returns metadata about the given one-click provider for rendering a relevant login button.
 *
 * @param provider The provider for which to retrieve the metadata.
 * @return Name, icon, URL and CSS class of the given provider for rendering a login button.
 */
export const getOneClickProviderMetadata = (provider: AuthProvider): OneClickMetadata => {
  switch (provider.type) {
    case AuthProviderType.GITHUB:
      return {
        name: 'GitHub',
        icon: IconGithub,
        className: styles['btn-social-github'],
        url: getBackendAuthUrl('github')
      }
    case AuthProviderType.GITLAB:
      return {
        name: provider.providerName,
        icon: IconGitlab,
        className: styles['btn-social-gitlab'],
        url: getBackendAuthUrl(provider.identifier)
      }
    case AuthProviderType.GOOGLE:
      return {
        name: 'Google',
        icon: IconGoogle,
        className: styles['btn-social-google'],
        url: getBackendAuthUrl('google')
      }
    case AuthProviderType.OAUTH2:
      return {
        name: provider.providerName,
        icon: IconPersonRolodex,
        className: 'btn-primary',
        url: getBackendAuthUrl(provider.identifier)
      }
    case AuthProviderType.SAML:
      return {
        name: provider.providerName,
        icon: IconPeople,
        className: 'btn-success',
        url: getBackendAuthUrl(provider.identifier)
      }
    default:
      logger.warn('Metadata for one-click-provider does not exist', provider)
      return {
        name: '',
        icon: IconExclamation,
        className: '',
        url: '#'
      }
  }
}
