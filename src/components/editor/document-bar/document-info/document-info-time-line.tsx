import { DateTime } from 'luxon'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { IconName } from '../../../common/fork-awesome/types'
import { DocumentInfoLine } from './document-info-line'
import './document-info-time-line.scss'
import { TimeFromNow } from './time-from-now'
import { UserAvatar } from '../../../common/user-avatar/user-avatar'

export interface DocumentInfoLineWithTimeProps {
  time: DateTime,
  mode: DocumentInfoLineWithTimeMode
  userName: string
  profileImageSrc: string
}

export enum DocumentInfoLineWithTimeMode {
  CREATED,
  EDITED
}

export const DocumentInfoTimeLine: React.FC<DocumentInfoLineWithTimeProps> = ({ time, mode, userName, profileImageSrc }) => {
  useTranslation()

  const i18nKey = mode === DocumentInfoLineWithTimeMode.CREATED ? 'editor.modal.documentInfo.created' : 'editor.modal.documentInfo.edited'
  const icon: IconName = mode === DocumentInfoLineWithTimeMode.CREATED ? 'plus' : 'pencil'

  return (
    <DocumentInfoLine icon={icon}>
      <Trans i18nKey={i18nKey} >
        <UserAvatar photo={profileImageSrc} additionalClasses={'document-info-avatar font-style-normal bold font-weight-bold'} name={userName}/>
        <TimeFromNow time={time}/>
      </Trans>
    </DocumentInfoLine>
  )
}
