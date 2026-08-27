/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { startOidcIdentityLink } from '../../../../api/identities'
import { useFrontendConfig } from '../../../common/frontend-config-context/use-frontend-config'
import { IconButton } from '../../../common/icon-button/icon-button'
import { getOneClickProviderMetadata } from '../../../login-page/one-click/get-one-click-provider-metadata'
import React, { useCallback, useMemo, useState } from 'react'
import { Alert, ListGroup } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import type { AuthProviderWithCustomNameInterface, LinkedIdentityInterface } from '@hedgedoc/commons'
import { AuthProviderType } from '@hedgedoc/commons'

interface LinkedIdentitiesProps {
  identities: LinkedIdentityInterface[]
}

/**
 * Displays the account's identities and starts OIDC linking transactions.
 *
 * @param identities The identities linked to the account.
 */
export const LinkedIdentities: React.FC<LinkedIdentitiesProps> = ({ identities }) => {
  const { authProviders, allowProfileEdits } = useFrontendConfig()
  const [linkingProvider, setLinkingProvider] = useState<string>()
  const [linkingFailed, setLinkingFailed] = useState(false)

  const oidcProviders = useMemo(() => {
    return authProviders.filter(
      (provider): provider is AuthProviderWithCustomNameInterface => provider.type === AuthProviderType.OIDC
    )
  }, [authProviders])

  const externalIdentities = useMemo(() => {
    return identities.filter((identity) => identity.providerType !== AuthProviderType.LOCAL)
  }, [identities])

  const onStartLink = useCallback(async (providerIdentifier: string) => {
    setLinkingProvider(providerIdentifier)
    setLinkingFailed(false)
    try {
      window.location.assign(await startOidcIdentityLink(providerIdentifier))
    } catch {
      setLinkingProvider(undefined)
      setLinkingFailed(true)
    }
  }, [])

  if (oidcProviders.length === 0) {
    return null
  }

  return (
    <fieldset className='border rounded p-3 mb-3'>
      <legend className='float-none w-auto px-2 fs-6'>
        <Trans i18nKey='profile.linkedIdentities.title' />
      </legend>
      <ListGroup className='mb-3'>
        {externalIdentities.map((identity) => (
          <ListGroup.Item key={`${identity.providerType}-${identity.providerIdentifier ?? ''}`}>
            {(
              authProviders.find(
                (provider) =>
                  provider.type !== AuthProviderType.LOCAL &&
                  provider.type === identity.providerType &&
                  provider.identifier === identity.providerIdentifier
              ) as AuthProviderWithCustomNameInterface | undefined
            )?.providerName ??
              identity.providerIdentifier ??
              identity.providerType}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <p className='small'>
        <Trans i18nKey='profile.linkedIdentities.info' />
      </p>
      <div className='d-flex flex-wrap gap-2'>
        {oidcProviders.map((provider) => {
          const metadata = getOneClickProviderMetadata(provider)
          const isLinked = identities.some(
            (identity) =>
              identity.providerType === AuthProviderType.OIDC && identity.providerIdentifier === provider.identifier
          )
          return (
            <IconButton
              key={provider.identifier}
              border={true}
              className={metadata.className}
              icon={metadata.icon}
              disabled={!allowProfileEdits || isLinked || linkingProvider !== undefined}
              onClick={() => void onStartLink(provider.identifier)}>
              <Trans
                i18nKey={isLinked ? 'profile.linkedIdentities.linked' : 'profile.linkedIdentities.link'}
                values={{ provider: provider.providerName }}
              />
            </IconButton>
          )
        })}
      </div>
      <Alert className='mt-3 mb-0' show={linkingFailed} variant='danger'>
        <Trans i18nKey='profile.linkedIdentities.linkFailed' />
      </Alert>
    </fieldset>
  )
}
