/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { FrontendConfigContextProvider } from '../../../common/frontend-config-context/frontend-config-context-provider'
import { render } from '@testing-library/react'
import React from 'react'
import type { FrontendConfigInterface, LinkedIdentityInterface } from '@hedgedoc/commons'
import { AuthProviderType, PermissionLevel } from '@hedgedoc/commons'
import { LinkedIdentities } from './linked-identities'

describe('LinkedIdentities', () => {
  const config: FrontendConfigInterface = {
    version: { major: 0, minor: 0, patch: 0, fullString: '', preRelease: undefined, commit: undefined },
    guestAccess: PermissionLevel.DENY,
    allowRegister: false,
    allowProfileEdits: true,
    allowChooseUsername: false,
    authProviders: [
      { type: AuthProviderType.LOCAL },
      { type: AuthProviderType.OIDC, identifier: 'example-oidc', providerName: 'Example OIDC', theme: null }
    ],
    branding: { name: null, logo: null },
    useImageProxy: false,
    specialUrls: { privacy: null, termsOfUse: null, imprint: null },
    plantUmlServer: null,
    maxDocumentLength: 0
  }

  const identities: LinkedIdentityInterface[] = [
    { providerType: AuthProviderType.LOCAL, providerIdentifier: null, createdAt: '2026-08-25T12:00:00.000Z' },
    {
      providerType: AuthProviderType.OIDC,
      providerIdentifier: 'example-oidc',
      createdAt: '2026-08-25T12:00:00.000Z'
    }
  ]

  beforeAll(mockI18n)

  it('displays linked external identities and disables their link button', () => {
    const view = render(
      <FrontendConfigContextProvider config={config}>
        <LinkedIdentities identities={identities} />
      </FrontendConfigContextProvider>
    )

    expect(view.getByText('Example OIDC')).toBeInTheDocument()
    expect(view.getByRole('button', { name: /profile.linkedIdentities.linked/ })).toBeDisabled()
  })

  it('disables new links when profile edits are disabled', () => {
    const view = render(
      <FrontendConfigContextProvider config={{ ...config, allowProfileEdits: false }}>
        <LinkedIdentities identities={identities.slice(0, 1)} />
      </FrontendConfigContextProvider>
    )

    expect(view.getByRole('button', { name: /profile.linkedIdentities.link/ })).toBeDisabled()
  })
})
