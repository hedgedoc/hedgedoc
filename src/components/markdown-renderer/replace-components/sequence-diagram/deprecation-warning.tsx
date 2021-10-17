/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import links from '../../../../links.json'
import { cypressId } from '../../../../utils/cypress-attribute'
import { TranslatedExternalLink } from '../../../common/links/translated-external-link'

export const DeprecationWarning: React.FC = () => {
  useTranslation()

  return (
    <Alert {...cypressId('yaml')} className={'mt-2'} variant={'warning'}>
      <span className={'text-wrap'}>
        <Trans i18nKey={'renderer.sequence.deprecationWarning'} />
      </span>
      <br />
      <TranslatedExternalLink i18nKey={'common.readForMoreInfo'} className={'text-primary'} href={links.faq} />
    </Alert>
  )
}
