/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'use client'

/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */
import { ProviderType } from '@hedgedoc/commons'
import { Redirect } from '../../../components/common/redirect'
import { LandingLayout } from '../../../components/landing-layout/landing-layout'
import { ProfileAccessTokens } from '../../../components/profile-page/access-tokens/profile-access-tokens'
import { ProfileAccountManagement } from '../../../components/profile-page/account-management/profile-account-management'
import { ProfileChangePassword } from '../../../components/profile-page/settings/profile-change-password'
import { ProfileDisplayName } from '../../../components/profile-page/settings/profile-display-name'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import type { NextPage } from 'next'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

/**
 * Profile page that includes forms for changing display name, password (if internal login is used),
 * managing access tokens and deleting the account.
 */
const ProfilePage: NextPage = () => {
  const userProvider = useApplicationState((state) => state.user?.authProvider)

  if (!userProvider) {
    return <Redirect to={'/login'} />
  }

  return (
    <LandingLayout>
      <div className='my-3'>
        <Row className='h-100 flex justify-content-center'>
          <Col lg={6}>
            <ProfileDisplayName />
            {userProvider === ProviderType.LOCAL && <ProfileChangePassword />}
            <ProfileAccessTokens />
            <ProfileAccountManagement />
          </Col>
        </Row>
      </div>
    </LandingLayout>
  )
}

export default ProfilePage
