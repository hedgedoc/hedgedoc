/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import type { IconName } from '../../common/fork-awesome/types'
import { SocialLinkButton } from './social-link-button/social-link-button'
import styles from './via-one-click.module.scss'

export enum OneClickType {
  'DROPBOX' = 'dropbox',
  'FACEBOOK' = 'facebook',
  'GITHUB' = 'github',
  'GITLAB' = 'gitlab',
  'GOOGLE' = 'google',
  'OAUTH2' = 'oauth2',
  'SAML' = 'saml',
  'TWITTER' = 'twitter'
}

interface OneClickMetadata {
  name: string
  icon: IconName
  className: string
  url: string
}

const buildBackendAuthUrl = (backendUrl: string, backendName: string): string => {
  return `${backendUrl}/auth/${backendName}`
}

const getMetadata = (backendUrl: string, oneClickType: OneClickType): OneClickMetadata => {
  const buildBackendAuthUrlWithFirstParameterSet = (backendName: string): string =>
    buildBackendAuthUrl(backendUrl, backendName)
  switch (oneClickType) {
    case OneClickType.DROPBOX:
      return {
        name: 'Dropbox',
        icon: 'dropbox',
        className: styles['btn-social-dropbox'],
        url: buildBackendAuthUrlWithFirstParameterSet('dropbox')
      }
    case OneClickType.FACEBOOK:
      return {
        name: 'Facebook',
        icon: 'facebook',
        className: styles['btn-social-facebook'],
        url: buildBackendAuthUrlWithFirstParameterSet('facebook')
      }
    case OneClickType.GITHUB:
      return {
        name: 'GitHub',
        icon: 'github',
        className: styles['btn-social-github'],
        url: buildBackendAuthUrlWithFirstParameterSet('github')
      }
    case OneClickType.GITLAB:
      return {
        name: 'GitLab',
        icon: 'gitlab',
        className: styles['btn-social-gitlab'],
        url: buildBackendAuthUrlWithFirstParameterSet('gitlab')
      }
    case OneClickType.GOOGLE:
      return {
        name: 'Google',
        icon: 'google',
        className: styles['btn-social-google'],
        url: buildBackendAuthUrlWithFirstParameterSet('google')
      }
    case OneClickType.OAUTH2:
      return {
        name: 'OAuth2',
        icon: 'address-card',
        className: 'btn-primary',
        url: buildBackendAuthUrlWithFirstParameterSet('oauth2')
      }
    case OneClickType.SAML:
      return {
        name: 'SAML',
        icon: 'users',
        className: 'btn-success',
        url: buildBackendAuthUrlWithFirstParameterSet('saml')
      }
    case OneClickType.TWITTER:
      return {
        name: 'Twitter',
        icon: 'twitter',
        className: styles['btn-social-twitter'],
        url: buildBackendAuthUrlWithFirstParameterSet('twitter')
      }
    default:
      return {
        name: '',
        icon: 'exclamation',
        className: '',
        url: '#'
      }
  }
}

export interface ViaOneClickProps {
  oneClickType: OneClickType
  optionalName?: string
}

export const ViaOneClick: React.FC<ViaOneClickProps> = ({ oneClickType, optionalName }) => {
  const backendUrl = useApplicationState((state) => state.apiUrl.apiUrl)
  const { name, icon, className, url } = getMetadata(backendUrl, oneClickType)
  const text = optionalName || name

  return (
    <SocialLinkButton backgroundClass={className} icon={icon} href={url} title={text}>
      {text}
    </SocialLinkButton>
  )
}
