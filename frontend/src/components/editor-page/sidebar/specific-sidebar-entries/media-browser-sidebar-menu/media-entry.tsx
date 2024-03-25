/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useMemo } from 'react'
import type { MediaUpload } from '../../../../../api/media/types'
import { useBaseUrl } from '../../../../../hooks/common/use-base-url'
import { Button, ButtonGroup } from 'react-bootstrap'
import {
  Trash as IconTrash,
  FileRichtextFill as IconFileRichtextFill,
  Person as IconPerson,
  Clock as IconClock
} from 'react-bootstrap-icons'
import { useIsOwner } from '../../../../../hooks/common/use-is-owner'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { UserAvatarForUsername } from '../../../../common/user-avatar/user-avatar-for-username'
import { useChangeEditorContentCallback } from '../../../change-content-context/use-change-editor-content-callback'
import { replaceSelection } from '../../../editor-pane/tool-bar/formatters/replace-selection'
import { useBooleanState } from '../../../../../hooks/common/use-boolean-state'
import { MediaEntryDeletionModal } from './media-entry-deletion-modal'

export interface MediaEntryProps {
  entry: MediaUpload
}

/**
 * Renders a single media entry in the media browser.
 *
 * @param entry The media entry to render
 */
export const MediaEntry: React.FC<MediaEntryProps> = ({ entry }) => {
  const changeEditorContent = useChangeEditorContentCallback()
  const user = useApplicationState((state) => state.user?.username)
  const baseUrl = useBaseUrl()
  const isOwner = useIsOwner()

  const [deletionModalVisible, showDeletionModal, hideDeletionModal] = useBooleanState(false)

  const imageUrl = useMemo(() => {
    return `${baseUrl}api/private/media/${entry.id}`
  }, [entry, baseUrl])
  const textCreatedTime = useMemo(() => {
    return new Date(entry.createdAt).toLocaleString()
  }, [entry])

  const handleInsertIntoNote = useCallback(() => {
    changeEditorContent?.(({ currentSelection }) => {
      return replaceSelection(
        { from: currentSelection.to ?? currentSelection.from },
        `![${entry.id}](${imageUrl})`,
        true
      )
    })
  }, [changeEditorContent, entry, imageUrl])

  return (
    <Fragment>
      <div className={'p-2 border-bottom border-opacity-50'}>
        <a href={imageUrl} target={'_blank'} rel={'noreferrer'} className={'text-center d-block mb-2'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={`Upload ${entry.id}`} height={100} className={'mw-100'} />
        </a>
        <div className={'w-100 d-flex flex-row align-items-center justify-content-between'}>
          <div>
            <small className={'d-inline-flex flex-row align-items-center'}>
              <IconPerson className={'me-1'} />
              <UserAvatarForUsername username={entry.username} size={'sm'} />
            </small>
            <br />
            <small>
              <IconClock className={'me-1'} />
              {textCreatedTime}
            </small>
          </div>
          <ButtonGroup className={'my-2'}>
            <Button size={'sm'} variant={'primary'} onClick={handleInsertIntoNote}>
              <IconFileRichtextFill />
            </Button>
            <Button
              size={'sm'}
              variant={'danger'}
              disabled={!isOwner && (!user || entry.username !== user)}
              onClick={showDeletionModal}>
              <IconTrash />
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <MediaEntryDeletionModal entry={entry} show={deletionModalVisible} onHide={hideDeletionModal} />
    </Fragment>
  )
}
