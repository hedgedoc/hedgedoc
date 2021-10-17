/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { ShowIf } from '../common/show-if/show-if'
import type { SimpleAlertProps } from '../common/simple-alert/simple-alert-props'

export const DocumentLengthLimitReachedAlert: React.FC<SimpleAlertProps> = ({ show }) => {
  useTranslation()

  const maxLength = useApplicationState((state) => state.config.maxDocumentLength)

  return (
    <ShowIf condition={show}>
      <Alert variant='danger' dir={'auto'} data-cy={'limitReachedMessage'}>
        <Trans i18nKey={'editor.error.limitReached.description'} values={{ maxLength }} />
      </Alert>
    </ShowIf>
  )
}
