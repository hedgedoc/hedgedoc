import { DateTime } from 'luxon'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { InternalLink } from '../common/links/internal-link'
import { ShowIf } from '../common/show-if/show-if'
import './document-infobar.scss'
import {
  DocumentInfoLineWithTimeMode,
  DocumentInfoTimeLine
} from '../editor/document-bar/document-info/document-info-time-line'

export interface DocumentInfobarProps {
  changedAuthor: string
  changedTime: number
  createdAuthor: string
  createdTime: number
  editable: boolean
  noteId: string
  viewCount: number
}

export const DocumentInfobar: React.FC<DocumentInfobarProps> = ({
  changedAuthor,
  changedTime,
  createdAuthor,
  createdTime,
  editable,
  noteId,
  viewCount
}) => {
  const { t } = useTranslation()

  return (
    <div className={'d-flex flex-row my-3 document-infobar'}>
      <div className={'col-md'}>&nbsp;</div>
      <div className={'d-flex flex-fill'}>
        <div className={'d-flex flex-column'}>
          <DocumentInfoTimeLine
            mode={DocumentInfoLineWithTimeMode.CREATED}
            time={ DateTime.fromSeconds(createdTime) }
            userName={createdAuthor}
            profileImageSrc={'/avatar.png'}/>
          <DocumentInfoTimeLine
            mode={DocumentInfoLineWithTimeMode.EDITED}
            time={ DateTime.fromSeconds(changedTime) }
            userName={changedAuthor}
            profileImageSrc={'/avatar.png'}/>
          <hr/>
        </div>
        <span className={'ml-auto'}>
          { viewCount } <Trans i18nKey={'views.readOnly.viewCount'}/>
          <ShowIf condition={editable}>
            <InternalLink text={''} href={`/n/${noteId}`} icon={'pencil'} className={'text-primary text-decoration-none mx-1'} title={t('views.readOnly.editNote')}/>
          </ShowIf>
        </span>
      </div>
      <div className={'col-md'}>&nbsp;</div>
    </div>
  )
}
