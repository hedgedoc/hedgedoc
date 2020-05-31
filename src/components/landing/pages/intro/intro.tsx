import React from 'react'
import { ForkAwesomeIcon } from '../../../../fork-awesome/fork-awesome-icon'
import screenshot from './img/screenshot.png'
import { Trans, useTranslation } from 'react-i18next'
import { FeatureLinks } from './feature-links'
import { CoverButtons } from './cover-buttons/cover-buttons'

const Intro: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1>
        <ForkAwesomeIcon icon="file-text"/> CodiMD
      </h1>
      <p className="lead mb-5">
        <Trans i18nKey="app.slogan"/>
      </p>

      <CoverButtons/>

      <img alt={t('landing.intro.screenShotAltText')} src={screenshot} className="img-fluid mb-5"/>
      <FeatureLinks/>
    </div>
  )
}

export { Intro }
