/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '../api/config/types'
import { Redirect } from '../components/common/redirect'
import { ShowIf } from '../components/common/show-if/show-if'
import { LandingLayout } from '../components/landing-layout/landing-layout'
import { ProfileAccessTokens } from '../components/profile-page/access-tokens/profile-access-tokens'
import { ProfileAccountManagement } from '../components/profile-page/account-management/profile-account-management'
import { ProfileChangePassword } from '../components/profile-page/settings/profile-change-password'
import { ProfileDisplayName } from '../components/profile-page/settings/profile-display-name'
import { useApplicationState } from '../hooks/common/use-application-state'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

/**
 * Profile page that includes forms for changing display name, password (if internal login is used),
 * managing access tokens and deleting the account.
 */
export const ProfilePage: React.FC = () => {
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
            <ShowIf condition={userProvider === (AuthProviderType.LOCAL as string)}>
              <ProfileChangePassword />
            </ShowIf>
            <ProfileAccessTokens />
            <ProfileAccountManagement />
          </Col>
        </Row>
      </div>
    </LandingLayout>
  )
}

export default ProfilePage
