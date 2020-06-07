import React from 'react'
import { IconName } from '../../../../common/fork-awesome/fork-awesome-icon'
import { SocialLinkButton } from './social-link-button/social-link-button'

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

type OneClick2Map = (oneClickType: OneClickType) => {
  name: string,
  icon: IconName,
  className: string,
  url: string
};

const buildBackendAuthUrl = (backendName: string) => {
  return `https://localhost:3000/auth/${backendName}`
}

const getMetadata: OneClick2Map = (oneClickType: OneClickType) => {
  switch (oneClickType) {
    case OneClickType.DROPBOX:
      return {
        name: 'Dropbox',
        icon: 'dropbox',
        className: 'btn-social-dropbox',
        url: buildBackendAuthUrl('dropbox')
      }
    case OneClickType.FACEBOOK:
      return {
        name: 'Facebook',
        icon: 'facebook',
        className: 'btn-social-facebook',
        url: buildBackendAuthUrl('facebook')
      }
    case OneClickType.GITHUB:
      return {
        name: 'GitHub',
        icon: 'github',
        className: 'btn-social-github',
        url: buildBackendAuthUrl('github')
      }
    case OneClickType.GITLAB:
      return {
        name: 'GitLab',
        icon: 'gitlab',
        className: 'btn-social-gitlab',
        url: buildBackendAuthUrl('gitlab')
      }
    case OneClickType.GOOGLE:
      return {
        name: 'Google',
        icon: 'google',
        className: 'btn-social-google',
        url: buildBackendAuthUrl('google')
      }
    case OneClickType.OAUTH2:
      return {
        name: 'OAuth2',
        icon: 'address-card',
        className: 'btn-primary',
        url: buildBackendAuthUrl('oauth2')
      }
    case OneClickType.SAML:
      return {
        name: 'SAML',
        icon: 'users',
        className: 'btn-success',
        url: buildBackendAuthUrl('saml')
      }
    case OneClickType.TWITTER:
      return {
        name: 'Twitter',
        icon: 'twitter',
        className: 'btn-social-twitter',
        url: buildBackendAuthUrl('twitter')
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
  oneClickType: OneClickType;
  optionalName?: string;
}

const ViaOneClick: React.FC<ViaOneClickProps> = ({ oneClickType, optionalName }) => {
  const { name, icon, className, url } = getMetadata(oneClickType)
  const text = optionalName || name
  return (
    <SocialLinkButton
      backgroundClass={className}
      icon={icon}
      href={url}
      title={text}
    >
      {text}
    </SocialLinkButton>
  )
}

export { ViaOneClick }
