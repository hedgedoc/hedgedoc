/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { ShowIf } from '../common/show-if/show-if'
import type { SimpleAlertProps } from '../common/simple-alert/simple-alert-props'

export const LoadingNoteAlert: React.FC<SimpleAlertProps> = ({ show }) => {
  return (
    <ShowIf condition={show}>
      <Alert variant={'info'} className={'my-2'}>
        <Trans i18nKey={'views.readOnly.loading'} />
      </Alert>
    </ShowIf>
  )
}
