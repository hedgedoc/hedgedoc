/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../common/show-if/show-if'
import type { SimpleAlertProps } from '../common/simple-alert/simple-alert-props'

export const ErrorWhileLoadingNoteAlert: React.FC<SimpleAlertProps> = ({ show }) => {
  useTranslation()

  return (
    <ShowIf condition={show}>
      <Alert variant={'danger'} className={'my-2'}>
        <b>
          <Trans i18nKey={'views.readOnly.error.title'} />
        </b>
        <br />
        <Trans i18nKey={'views.readOnly.error.description'} />
      </Alert>
    </ShowIf>
  )
}
