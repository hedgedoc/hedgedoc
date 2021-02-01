/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { IconName } from '../../../common/fork-awesome/types'
import { UserAvatar } from '../../../common/user-avatar/user-avatar'
import { DocumentInfoLine } from './document-info-line'
import { TimeFromNow } from './time-from-now'

export interface DocumentInfoLineWithTimeProps {
  size?: '2x' | '3x' | '4x' | '5x' | undefined
  time: DateTime,
  mode: DocumentInfoLineWithTimeMode
  userName: string
  profileImageSrc: string
}

export enum DocumentInfoLineWithTimeMode {
  CREATED,
  EDITED
}

export const DocumentInfoTimeLine: React.FC<DocumentInfoLineWithTimeProps> = ({ time, mode, userName, profileImageSrc, size }) => {
  useTranslation()

  const i18nKey = mode === DocumentInfoLineWithTimeMode.CREATED ? 'editor.modal.documentInfo.created' : 'editor.modal.documentInfo.edited'
  const icon: IconName = mode === DocumentInfoLineWithTimeMode.CREATED ? 'plus' : 'pencil'

  return (
    <DocumentInfoLine icon={icon} size={size}>
      <Trans i18nKey={i18nKey} >
        <UserAvatar photo={profileImageSrc} additionalClasses={'font-style-normal bold font-weight-bold'} name={userName} size={size ? 'lg' : undefined}/>
        <TimeFromNow time={time}/>
      </Trans>
    </DocumentInfoLine>
  )
}
