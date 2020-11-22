/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import links from '../../../../links.json'
import { TranslatedExternalLink } from '../../../common/links/translated-external-link'

export const DeprecationWarning: React.FC = () => {
  useTranslation()

  return (
    <Alert className={'mt-2'} variant={'warning'}>
      <Trans i18nKey={'renderer.sequence.deprecationWarning'}/>
      &nbsp;
      <TranslatedExternalLink i18nKey={'common.why'} className={'text-primary'} href={links.faq}/>
    </Alert>
  )
}
