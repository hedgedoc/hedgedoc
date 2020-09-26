import React, { Fragment } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router'
import { ApplicationState } from '../../redux'
import { ShowIf } from '../common/show-if/show-if'
import { ViaInternal } from './auth/via-internal'
import { ViaLdap } from './auth/via-ldap'
import { OneClickType, ViaOneClick } from './auth/via-one-click'
import { ViaOpenId } from './auth/via-openid'
import equal from 'fast-deep-equal'

export const LoginPage: React.FC = () => {
  useTranslation()
  const authProviders = useSelector((state: ApplicationState) => state.config.authProviders, equal)
  const customSamlAuthName = useSelector((state: ApplicationState) => state.config.customAuthNames.saml)
  const customOauthAuthName = useSelector((state: ApplicationState) => state.config.customAuthNames.oauth2)
  const userLoggedIn = useSelector((state: ApplicationState) => !!state.user)

  const oneClickProviders = [authProviders.dropbox, authProviders.facebook, authProviders.github, authProviders.gitlab,
    authProviders.google, authProviders.oauth2, authProviders.saml, authProviders.twitter]

  const oneClickCustomName: (type: OneClickType) => string | undefined = (type) => {
    switch (type) {
      case OneClickType.SAML:
        return customSamlAuthName
      case OneClickType.OAUTH2:
        return customOauthAuthName
      default:
        return undefined
    }
  }

  if (userLoggedIn) {
    // TODO Redirect to previous page?
    return (
      <Redirect to='/history'/>
    )
  }

  return <Fragment>
    <div className="my-3">
      <Row className="h-100 flex justify-content-center">
        <ShowIf condition={authProviders.internal || authProviders.ldap || authProviders.openid}>
          <Col xs={12} sm={10} lg={4}>
            <ShowIf condition={authProviders.internal}><ViaInternal/></ShowIf>
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
  </Fragment>
}
