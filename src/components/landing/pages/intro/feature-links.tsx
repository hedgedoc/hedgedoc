import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'

export const FeatureLinks: React.FC = () => {
  useTranslation()
  return (
    <Row className="mb-5">
      <Col md={4}>
        <Link to={'/features#Share-Notes'} className="text-light">
          <ForkAwesomeIcon icon="bolt" size="3x"/>
          <h5>
            <Trans i18nKey="landing.intro.features.collaboration"/>
          </h5>
        </Link>
      </Col>
      <Col md={4}>
        <Link to={'/features#MathJax'} className="text-light">
          <ForkAwesomeIcon icon="bar-chart" size="3x"/>
          <h5>
            <Trans i18nKey="landing.intro.features.mathJax"/>
          </h5>
        </Link>
      </Col>
      <Col md={4}>
        <Link to={'/features#Slide-Mode'} className="text-light">
          <ForkAwesomeIcon icon="television" size="3x"/>
          <h5>
            <Trans i18nKey="landing.intro.features.slides"/>
          </h5>
        </Link>
      </Col>
    </Row>
  )
}
