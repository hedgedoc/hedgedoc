/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import links from '../../../links.json'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'
import { ShowIf } from '../../common/show-if/show-if'
import { useApplicationState } from '../../../hooks/common/use-application-state'

export const YamlArrayDeprecationAlert: React.FC = () => {
  useTranslation()
  const yamlDeprecatedTags = useApplicationState((state) => state.noteDetails.frontmatter.deprecatedTagsSyntax)

  return (
    <ShowIf condition={yamlDeprecatedTags}>
      <Alert data-cy={'yamlArrayDeprecationAlert'} className={'text-wrap'} variant='warning' dir='auto'>
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
