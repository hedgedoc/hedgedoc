/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfigDto } from '@hedgedoc/commons'
import { ProviderType, GuestAccess } from '@hedgedoc/commons'
import {
  HttpMethod,
  respondToMatchingRequest,
  respondToTestRequest
} from '../../../handler-utils/respond-to-matching-request'
import { isTestMode } from '../../../utils/test-modes'
import type { NextApiRequest, NextApiResponse } from 'next'

const initialConfig: FrontendConfigDto = {
  allowRegister: true,
  allowProfileEdits: true,
  allowChooseUsername: true,
  branding: {
    name: 'DEMO Corp',
    logo: '/public/img/demo.png'
  },
  guestAccess: GuestAccess.WRITE,
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
    commit: 'mock',
    fullString: `${isTestMode ? 0 : 2}.0.0`
  },
  plantUmlServer: isTestMode ? 'http://mock-plantuml.local' : 'https://www.plantuml.com/plantuml',
  maxDocumentLength: isTestMode ? 200 : 1000000,
  authProviders: [
    {
      type: ProviderType.LOCAL
    },
    {
      type: ProviderType.LDAP,
      identifier: 'test-ldap',
      providerName: 'Test LDAP',
      theme: null
    },
    {
      type: ProviderType.OIDC,
      identifier: 'test-oidc',
      providerName: 'Test OIDC',
      theme: null
    }
  ]
}

let currentConfig: FrontendConfigDto = initialConfig

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const responseSuccessful = respondToMatchingRequest<FrontendConfigDto>(
    HttpMethod.GET,
    req,
    res,
    currentConfig,
    200,
    false
  )
  if (!responseSuccessful) {
    respondToTestRequest<FrontendConfigDto>(req, res, () => {
      currentConfig = {
        ...initialConfig,
        ...(req.body as FrontendConfigDto)
      }
      return currentConfig
    })
  }
}

export default handler
