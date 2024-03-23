/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { EditorToRendererCommunicatorContextProvider } from '../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { HedgeDocLogoVertical } from '../common/hedge-doc-logo/hedge-doc-logo-vertical'
import { LogoSize } from '../common/hedge-doc-logo/logo-size'
import { Trans } from 'react-i18next'
import { CustomBranding } from '../common/custom-branding/custom-branding'
import { IntroCustomContent } from '../intro-page/intro-custom-content'

/**
 * Layout for the login page with the intro content on the left and children on the right.
 * @param children The content to show on the right
 */
export const LoginLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container>
      <Row>
        <Col xs={8}>
          <EditorToRendererCommunicatorContextProvider>
            <div className={'d-flex flex-column align-items-center mt-3'}>
              <HedgeDocLogoVertical size={LogoSize.BIG} autoTextColor={true} />
              <h5>
                <Trans i18nKey='app.slogan' />
              </h5>
              <div className={'mb-5'}>
                <CustomBranding />
              </div>
              <IntroCustomContent />
            </div>
          </EditorToRendererCommunicatorContextProvider>
        </Col>
        <Col xs={4} className={'pt-3 d-flex gap-3 flex-column'}>
          {children}
        </Col>
      </Row>
    </Container>
  )
}
