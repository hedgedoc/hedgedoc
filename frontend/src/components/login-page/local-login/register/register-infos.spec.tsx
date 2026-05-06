/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { render } from '@testing-library/react'
import { FrontendConfigContextProvider } from '../../../common/frontend-config-context/frontend-config-context-provider'
import { RegisterInfos } from './register-infos'
import type { FrontendConfigInterface } from '@hedgedoc/commons'
import { PermissionLevel } from '@hedgedoc/commons'

describe('Register Infos', () => {
  let mockFrontendConfig: FrontendConfigInterface
  beforeAll(mockI18n)
  beforeEach(() => {
    mockFrontendConfig = {
      version: {
        major: 0,
        minor: 0,
        patch: 0,
        fullString: '',
        preRelease: undefined,
        commit: undefined
      },
      guestAccess: PermissionLevel.DENY,
      allowRegister: false,
      allowProfileEdits: false,
      allowChooseUsername: false,
      authProviders: [],
      branding: {
        name: null,
        logo: null
      },
      useImageProxy: false,
      specialUrls: {
        privacy: null,
        termsOfUse: null,
        imprint: null
      },
      plantUmlServer: null,
      maxDocumentLength: 0
    }
  })

  it('does not show any links if the frontend config links are null', async () => {
    const view = render(
      <FrontendConfigContextProvider config={mockFrontendConfig}>
        <RegisterInfos />
      </FrontendConfigContextProvider>
    )
    expect(view.container).toMatchSnapshot('no links')
  })

  it('only shows termsOfUse links', async () => {
    mockFrontendConfig.specialUrls.termsOfUse = 'https://example.com/terms-of-use'
    const view = render(
      <FrontendConfigContextProvider config={mockFrontendConfig}>
        <RegisterInfos />
      </FrontendConfigContextProvider>
    )
    expect(view.container).toMatchSnapshot('termsOfUse link')
  })

  it('only shows privacy links', async () => {
    mockFrontendConfig.specialUrls.privacy = 'https://example.com/privacy'
    const view = render(
      <FrontendConfigContextProvider config={mockFrontendConfig}>
        <RegisterInfos />
      </FrontendConfigContextProvider>
    )
    expect(view.container).toMatchSnapshot('privacy link')
  })

  it('show privacy and termsOfUse links', async () => {
    mockFrontendConfig.specialUrls.termsOfUse = 'https://example.com/terms-of-use'
    mockFrontendConfig.specialUrls.privacy = 'https://example.com/privacy'
    const view = render(
      <FrontendConfigContextProvider config={mockFrontendConfig}>
        <RegisterInfos />
      </FrontendConfigContextProvider>
    )
    expect(view.container).toMatchSnapshot('privacy and termsOfUse link')
  })
})
