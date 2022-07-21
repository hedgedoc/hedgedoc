/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import links from '../../../links.json'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'
import { ShowIf } from '../../common/show-if/show-if'
import type { CommonModalProps } from '../../common/modals/common-modal'
import { cypressId } from '../../../utils/cypress-attribute'

/**
 * Renders an alert that indicated that the front matter tags property is using a deprecated format.
 *
 * @param show If the alert should be shown.
 */
export const YamlArrayDeprecationAlert: React.FC<Partial<CommonModalProps>> = ({ show }) => {
  useTranslation()

  return (
    <ShowIf condition={!!show}>
      <Alert {...cypressId('yamlArrayDeprecationAlert')} className={'text-wrap'} variant='warning' dir='auto'>
        <span className={'text-wrap'}>
          <span className={'text-wrap'}>
            <Trans i18nKey='editor.deprecatedTags' />
          </span>
        </span>
        <br />
        <TranslatedExternalLink i18nKey={'common.readForMoreInfo'} href={links.faq} className={'text-primary'} />
      </Alert>
    </ShowIf>
  )
}
