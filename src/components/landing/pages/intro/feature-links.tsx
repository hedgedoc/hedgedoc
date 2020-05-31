import React from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Trans, useTranslation } from 'react-i18next'

export const FeatureLinks: React.FC = () => {
  useTranslation()
  return (
    <Row className="mb-5">
      <Col md={4}>
        <Link to={'/features#Share-Notes'} className="text-light">
          <FontAwesomeIcon icon="bolt" size="3x"/>
          <h5>
            <Trans i18nKey="landing.intro.features.collaboration"/>
          </h5>
        </Link>
      </Col>
      <Col md={4}>
        <Link to={'/features#MathJax'} className="text-light">
          <FontAwesomeIcon icon="chart-bar" size="3x"/>
          <h5>
            <Trans i18nKey="landing.intro.features.mathJax"/>
          </h5>
        </Link>
      </Col>
      <Col md={4}>
        <Link to={'/features#Slide-Mode'} className="text-light">
          <FontAwesomeIcon icon="tv" size="3x"/>
          <h5>
            <Trans i18nKey="landing.intro.features.slides"/>
          </h5>
        </Link>
      </Col>
    </Row>
  )
}
