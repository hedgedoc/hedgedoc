/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfig } from '../../../api/config/types'
import { AuthProviderType, GuestAccessLevel } from '../../../api/config/types'
import {
  HttpMethod,
  respondToMatchingRequest,
  respondToTestRequest
} from '../../../handler-utils/respond-to-matching-request'
import { isTestMode } from '../../../utils/test-modes'
import type { NextApiRequest, NextApiResponse } from 'next'

const initialConfig: FrontendConfig = {
  allowRegister: true,
  allowProfileEdits: true,
  allowChooseUsername: true,
  branding: {
    name: 'DEMO Corp',
    logo: '/public/img/demo.png'
  },
  guestAccess: GuestAccessLevel.WRITE,
  useImageProxy: false,
  specialUrls: {
    privacy: 'https://example.com/privacy',
    termsOfUse: 'https://example.com/termsOfUse',
    imprint: 'https://example.com/imprint'
  },
  version: {
    major: isTestMode ? 0 : 2,
    minor: 0,
    patch: 0,
    preRelease: isTestMode ? undefined : '',
    commit: 'mock'
  },
  plantumlServer: isTestMode ? 'http://mock-plantuml.local' : 'https://www.plantuml.com/plantuml',
  maxDocumentLength: isTestMode ? 200 : 1000000,
  authProviders: [
    {
      type: AuthProviderType.LOCAL
    },
    {
      type: AuthProviderType.LDAP,
      identifier: 'test-ldap',
      providerName: 'Test LDAP'
    },
    {
      type: AuthProviderType.OIDC,
      identifier: 'test-oidc',
      providerName: 'Test OIDC'
    }
  ]
}

let currentConfig: FrontendConfig = initialConfig

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  // This is shorter than storing the return boolean in a variable and then calling respondToTestRequest with if
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  respondToMatchingRequest<FrontendConfig>(HttpMethod.GET, req, res, currentConfig, 200, false) ||
    respondToTestRequest<FrontendConfig>(req, res, () => {
      currentConfig = {
        ...initialConfig,
        ...(req.body as FrontendConfig)
      }
      return currentConfig
    })
}

export default handler
