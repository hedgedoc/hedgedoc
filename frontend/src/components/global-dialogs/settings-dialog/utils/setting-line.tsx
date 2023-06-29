/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Col, ListGroup, Row } from 'react-bootstrap'
import { Trans } from 'react-i18next'

export interface SettingLineProps {
  i18nKey: string
}

/**
 * Renders one setting with label and help text
 *
 * @param i18nKey The i18n key that is used as namespace for label and help
 * @param children The setting control that should be placed in this line
 */
export const SettingLine: React.FC<PropsWithChildren<SettingLineProps>> = ({ i18nKey, children }) => {
  return (
    <ListGroup.Item>
      <Row>
        <Col md={3}>
          <Trans i18nKey={`settings.${i18nKey}.label`} />
        </Col>
        <Col md={4}>{children}</Col>
        <Col md={5}>
          <Trans i18nKey={`settings.${i18nKey}.help`} />
        </Col>
      </Row>
    </ListGroup.Item>
  )
}
