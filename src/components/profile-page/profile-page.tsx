/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Redirect } from 'react-router'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { LoginProvider } from '../../redux/user/types'
import { ShowIf } from '../common/show-if/show-if'
import { ProfileAccessTokens } from './access-tokens/profile-access-tokens'
import { ProfileAccountManagement } from './settings/profile-account-management'
import { ProfileChangePassword } from './settings/profile-change-password'
import { ProfileDisplayName } from './settings/profile-display-name'

export const ProfilePage: React.FC = () => {
  const userProvider = useApplicationState((state) => state.user?.provider)

  if (!userProvider) {
    return <Redirect to={'/login'} />
  }

  return (
    <Fragment>
      <div className='my-3'>
        <Row className='h-100 flex justify-content-center'>
          <Col lg={6}>
            <ProfileDisplayName />
            <ShowIf condition={userProvider === LoginProvider.INTERNAL}>
              <ProfileChangePassword />
            </ShowIf>
            <ProfileAccessTokens />
            <ProfileAccountManagement />
          </Col>
        </Row>
      </div>
    </Fragment>
  )
}
