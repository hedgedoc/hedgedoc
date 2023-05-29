/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AuthProvider } from '../../../../api/config/types'
import { AuthProviderType } from '../../../../api/config/types'
import { Logger } from '../../../../utils/logger'
import { IconGitlab } from '../../../common/icons/additional/icon-gitlab'
import styles from '../via-one-click.module.scss'
import type { Icon } from 'react-bootstrap-icons'
import {
  Dropbox as IconDropbox,
  Exclamation as IconExclamation,
  Facebook as IconFacebook,
  Github as IconGithub,
  Google as IconGoogle,
  People as IconPeople,
  PersonRolodex as IconPersonRolodex,
  Twitter as IconTwitter
} from 'react-bootstrap-icons'

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
    case AuthProviderType.DROPBOX:
      return {
        name: 'Dropbox',
        icon: IconDropbox,
        className: styles['btn-social-dropbox'],
        url: getBackendAuthUrl('dropbox')
      }
    case AuthProviderType.FACEBOOK:
      return {
        name: 'Facebook',
        icon: IconFacebook,
        className: styles['btn-social-facebook'],
        url: getBackendAuthUrl('facebook')
      }
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
    case AuthProviderType.TWITTER:
      return {
        name: 'Twitter',
        icon: IconTwitter,
        className: styles['btn-social-twitter'],
        url: getBackendAuthUrl('twitter')
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
