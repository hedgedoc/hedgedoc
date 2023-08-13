/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { UiIcon } from '../../../../../common/icons/ui-icon'
import { ExclamationTriangleFill as IconExclamationTriangleFill } from 'react-bootstrap-icons'
import type { SimpleAlertProps } from '../../../../../common/simple-alert/simple-alert-props'
import { useTranslatedText } from '../../../../../../hooks/common/use-translated-text'

/**
 * Alert that is shown when the permissions are inconsistent.
 *
 * @param show true to show the alert, false otherwise.
 */
export const PermissionInconsistentAlert: React.FC<SimpleAlertProps> = ({ show }) => {
  const message = useTranslatedText('editor.modal.permissions.inconsistent')

  if (!show) {
    return null
  }
  return <UiIcon icon={IconExclamationTriangleFill} className={'text-warning me-2'} title={message} />
}
