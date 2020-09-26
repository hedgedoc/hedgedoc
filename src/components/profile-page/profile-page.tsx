import React, { Fragment } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router'
import { ApplicationState } from '../../redux'
import { LoginProvider } from '../../redux/user/types'
import { ShowIf } from '../common/show-if/show-if'
import { ProfileAccountManagement } from './settings/profile-account-management'
import { ProfileChangePassword } from './settings/profile-change-password'
import { ProfileDisplayName } from './settings/profile-display-name'

export const ProfilePage: React.FC = () => {
  const userProvider = useSelector((state: ApplicationState) => state.user?.provider)

  if (!userProvider) {
    return (
      <Redirect to={'/login'}/>
    )
  }

  return <Fragment>
    <div className="my-3">
      <Row className="h-100 flex justify-content-center">
        <Col lg={6}>
          <ProfileDisplayName/>
          <ShowIf condition={userProvider === LoginProvider.INTERNAL}>
            <ProfileChangePassword/>
          </ShowIf>
          <ProfileAccountManagement/>
        </Col>
      </Row>
    </div>
  </Fragment>
}
