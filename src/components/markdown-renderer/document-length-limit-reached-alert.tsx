/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'
import { ShowIf } from '../common/show-if/show-if'

export interface DocumentLengthLimitReachedAlertProps {
  contentLength: number
}

export const DocumentLengthLimitReachedAlert: React.FC<DocumentLengthLimitReachedAlertProps> = ({ contentLength }) => {
  useTranslation()
  const maxLength = useSelector((state: ApplicationState) => state.config.maxDocumentLength)

  return (
    <ShowIf condition={contentLength > maxLength}>
      <Alert variant='danger' dir={'auto'} data-cy={'limitReachedMessage'}>
        <Trans i18nKey={'editor.error.limitReached.description'} values={{ maxLength }}/>
      </Alert>
    </ShowIf>)
}
