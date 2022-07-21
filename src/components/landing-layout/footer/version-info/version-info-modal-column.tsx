/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { CopyableField } from '../../../common/copyable/copyable-field/copyable-field'
import { TranslatedExternalLink } from '../../../common/links/translated-external-link'
import { ShowIf } from '../../../common/show-if/show-if'
import { Trans, useTranslation } from 'react-i18next'
import { Col } from 'react-bootstrap'

export interface VersionInfoModalColumnProps {
  titleI18nKey: string
  version: string
  sourceCodeLink: string
  issueTrackerLink: string
}

/**
 * Renders a column in the {@link VersionInfoModal}.
 *
 * @param titleI18nKey
 * @param issueTrackerLink
 * @param sourceCodeLink
 * @param version
 * @constructor
 */
export const VersionInfoModalColumn: React.FC<VersionInfoModalColumnProps> = ({
  titleI18nKey,
  issueTrackerLink,
  sourceCodeLink,
  version
}) => {
  useTranslation()

  return (
    <Col md={6} className={'flex-column'}>
      <h5>
        <Trans i18nKey={titleI18nKey} />
      </h5>
      <CopyableField content={version} />
      <ShowIf condition={!!sourceCodeLink}>
        <TranslatedExternalLink
          i18nKey={'landing.versionInfo.sourceCode'}
          className={'btn btn-sm btn-primary d-block mb-2'}
          href={sourceCodeLink}
        />
      </ShowIf>
      <ShowIf condition={!!issueTrackerLink}>
        <TranslatedExternalLink
          i18nKey={'landing.versionInfo.issueTracker'}
          className={'btn btn-sm btn-primary d-block mb-2'}
          href={issueTrackerLink}
        />
      </ShowIf>
    </Col>
  )
}
