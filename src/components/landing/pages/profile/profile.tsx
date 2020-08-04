import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router'
import { ApplicationState } from '../../../../redux'
import { LoginProvider } from '../../../../redux/user/types'
import { ShowIf } from '../../../common/show-if/show-if'
import { ProfileAccountManagement } from './settings/profile-account-management'
import { ProfileChangePassword } from './settings/profile-change-password'
import { ProfileDisplayName } from './settings/profile-display-name'

export const Profile: React.FC = () => {
  const user = useSelector((state: ApplicationState) => state.user)

  if (!user) {
    return (
      <Redirect to={'/login'}/>
    )
  }

  return (
    <div className="my-3">
      <Row className="h-100 flex justify-content-center">
        <Col lg={6}>
          <ProfileDisplayName/>
          <ShowIf condition={user.provider === LoginProvider.INTERNAL}>
            <ProfileChangePassword/>
          </ShowIf>
          <ProfileAccountManagement/>
        </Col>
      </Row>
    </div>
  )
}
