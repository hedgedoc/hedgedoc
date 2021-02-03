/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Branding } from '../common/branding/branding'
import {
  HedgeDocLogoSize,
  HedgeDocLogoType,
  HedgeDocLogoWithText
} from '../common/hedge-doc-logo/hedge-doc-logo-with-text'
import { CoverButtons } from './cover-buttons/cover-buttons'
import { FeatureLinks } from './feature-links'
import screenshot from './img/screenshot.png'

export const IntroPage: React.FC = () => {
  const { t } = useTranslation()

  return <Fragment>
    <h1 dir='auto' className={ 'align-items-center d-flex justify-content-center flex-column' }>
      <HedgeDocLogoWithText logoType={ HedgeDocLogoType.COLOR_VERTICAL } size={ HedgeDocLogoSize.BIG }/>
    </h1>
    <p className="lead">
      <Trans i18nKey="app.slogan"/>
    </p>
    <div className={ 'mb-5' }>
      <Branding delimiter={ false }/>
    </div>

    <CoverButtons/>
    <img alt={ t('landing.intro.screenShotAltText') } src={ screenshot } className="img-fluid mb-5"/>
    <FeatureLinks/>
  </Fragment>
}
