/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import React, { useMemo } from 'react'
import { ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { UserAvatar } from '../../../common/user-avatar/user-avatar'
import styles from './revision-list-entry.module.scss'
import type { RevisionMetadata } from '../../../../api/revisions/types'
import { getUserDataForRevision } from './utils'
import { useAsync } from 'react-use'
import { ShowIf } from '../../../common/show-if/show-if'
import { WaitSpinner } from '../../../common/wait-spinner/wait-spinner'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'

export interface RevisionListEntryProps {
  active: boolean
  onSelect: () => void
  revision: RevisionMetadata
}

/**
 * Renders an entry in the revision list.
 *
 * @param active true if this is the currently selected revision entry.
 * @param onSelect Callback that is fired  when this revision entry is selected.
 * @param revision The metadata for this revision entry.
 */
export const RevisionListEntry: React.FC<RevisionListEntryProps> = ({ active, onSelect, revision }) => {
  useTranslation()
  const { showErrorNotification } = useUiNotifications()

  const revisionCreationTime = useMemo(() => {
    return DateTime.fromISO(revision.createdAt).toFormat('DDDD T')
  }, [revision.createdAt])

  const revisionAuthors = useAsync(async () => {
    try {
      const authorDetails = await getUserDataForRevision(revision.authorUsernames)
      return authorDetails.map((author) => (
        <UserAvatar user={author} key={author.username} showName={false} additionalClasses={'mx-1'} />
      ))
    } catch (error) {
      showErrorNotification('editor.modal.revision.errorUser')(error as Error)
      return null
    }
  }, [])

  return (
    <ListGroup.Item
      active={active}
      onClick={onSelect}
      className={`user-select-none ${styles['revision-item']} d-flex flex-column`}>
      <span>
        <ForkAwesomeIcon icon={'clock-o'} className='mx-2' />
        {revisionCreationTime}
      </span>
      <span>
        <ForkAwesomeIcon icon={'file-text-o'} className='mx-2' />
        <Trans i18nKey={'editor.modal.revision.length'} />: {revision.length}
      </span>
      <span className={'d-flex flex-row my-1 align-items-center'}>
        <ForkAwesomeIcon icon={'user-o'} className={'mx-2'} />
        <ShowIf condition={revisionAuthors.loading}>
          <WaitSpinner />
        </ShowIf>
        <ShowIf condition={!revisionAuthors.error && !revisionAuthors.loading}>{revisionAuthors.value}</ShowIf>
      </span>
    </ListGroup.Item>
  )
}
