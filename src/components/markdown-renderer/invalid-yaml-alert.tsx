/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { InternalLink } from '../common/links/internal-link'
import { ShowIf } from '../common/show-if/show-if'

export interface InvalidYamlAlertProps {
  showYamlError: boolean
}

export const InvalidYamlAlert: React.FC<InvalidYamlAlertProps> = ({ showYamlError }) => {
  useTranslation()

  return (
    <ShowIf condition={showYamlError}>
      <Alert variant='warning' dir='auto'>
        <Trans i18nKey='editor.invalidYaml'>
          <InternalLink text='yaml-metadata' href='/n/yaml-metadata' className='text-primary'/>
        </Trans>
      </Alert>
    </ShowIf>
  )
}
