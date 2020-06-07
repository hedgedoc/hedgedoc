import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router'
import { ApplicationState } from '../../../../redux'
import { ShowIf } from '../../../common/show-if/show-if'
import { ViaEMail } from './auth/via-email'
import { ViaLdap } from './auth/via-ldap'
import { OneClickType, ViaOneClick } from './auth/via-one-click'
import { ViaOpenId } from './auth/via-openid'

export const Login: React.FC = () => {
  useTranslation()
  const authProviders = useSelector((state: ApplicationState) => state.backendConfig.authProviders)
  const customAuthNames = useSelector((state: ApplicationState) => state.backendConfig.customAuthNames)
  const userLoginState = useSelector((state: ApplicationState) => state.user)

  const oneClickProviders = [authProviders.dropbox, authProviders.facebook, authProviders.github, authProviders.gitlab,
    authProviders.google, authProviders.oauth2, authProviders.saml, authProviders.twitter]

  const oneClickCustomName: (type: OneClickType) => string | undefined = (type) => {
    switch (type) {
      case OneClickType.SAML:
        return customAuthNames.saml
      case OneClickType.OAUTH2:
        return customAuthNames.oauth2
      default:
        return undefined
    }
  }

  if (userLoginState) {
    // TODO Redirect to previous page?
    return (
      <Redirect to='/history'/>
    )
  }

  return (
    <div className="my-3">
      <Row className="h-100 flex justify-content-center">
        <ShowIf condition={authProviders.email || authProviders.ldap || authProviders.openid}>
          <Col xs={12} sm={10} lg={4}>
            <ShowIf condition={authProviders.email}><ViaEMail/></ShowIf>
            <ShowIf condition={authProviders.ldap}><ViaLdap/></ShowIf>
            <ShowIf condition={authProviders.openid}><ViaOpenId/></ShowIf>
          </Col>
        </ShowIf>
        <ShowIf condition={oneClickProviders.includes(true)}>
          <Col xs={12} sm={10} lg={4}>
            <Card className="bg-dark mb-4">
              <Card.Body>
                <Card.Title>
                  <Trans i18nKey="login.signInVia" values={{ service: '' }}/>
                </Card.Title>
                {
                  Object.values(OneClickType)
                    .filter((value) => authProviders[value])
                    .map((value) => (
                      <div
                        className="p-2 d-flex flex-column social-button-container"
                        key={value}
                      >
                        <ViaOneClick
                          oneClickType={value}
                          optionalName={oneClickCustomName(value)}
                        />
                      </div>
                    ))
                }
              </Card.Body>
            </Card>
          </Col>
        </ShowIf>
      </Row>
    </div>
  )
}
