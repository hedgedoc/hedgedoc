/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react'
import { useBaseUrl } from '../../../../../hooks/common/use-base-url'
import { Button, ButtonGroup } from 'react-bootstrap'
import {
  Trash as IconTrash,
  FileRichtextFill as IconFileRichtextFill,
  Person as IconPerson,
  Clock as IconClock,
  FileText as IconFileText
} from 'react-bootstrap-icons'
import { useIsOwner } from '../../../../../hooks/common/use-is-owner'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { UserAvatarForUsername } from '../../../../common/user-avatar/user-avatar-for-username'
import { useChangeEditorContentCallback } from '../../../change-content-context/use-change-editor-content-callback'
import { replaceSelection } from '../../../editor-pane/tool-bar/formatters/replace-selection'
import styles from './media-entry.module.css'
import type { MediaUploadDto } from '@hedgedoc/commons'

export interface MediaEntryProps {
  entry: MediaUploadDto
  onDelete: (entry: MediaUploadDto) => void
}

/**
 * Renders a single media entry in the media browser.
 *
 * @param entry The media entry to render
 * @param onDelete The callback to call when the entry should be deleted
 */
export const MediaEntry: React.FC<MediaEntryProps> = ({ entry, onDelete }) => {
  const changeEditorContent = useChangeEditorContentCallback()
  const user = useApplicationState((state) => state.user?.username)
  const baseUrl = useBaseUrl()
  const isOwner = useIsOwner()

  const imageUrl = useMemo(() => {
    return `${baseUrl}media/${entry.uuid}`
  }, [entry, baseUrl])
  const textCreatedTime = useMemo(() => {
    return new Date(entry.createdAt).toLocaleString()
  }, [entry])

  const handleInsertIntoNote = useCallback(() => {
    changeEditorContent?.(({ currentSelection }) => {
      return replaceSelection(
        { from: currentSelection.to ?? currentSelection.from },
        `![${entry.fileName}](${imageUrl})`,
        true
      )
    })
  }, [changeEditorContent, entry, imageUrl])

  const deleteEntry = useCallback(() => {
    onDelete(entry)
  }, [entry, onDelete])

  return (
    <div className={'p-2 border-bottom border-opacity-50'}>
      <a href={imageUrl} target={'_blank'} rel={'noreferrer'} className={'text-center d-block mb-2'}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={`Upload ${entry.fileName}`} className={styles.preview} />
      </a>
      <div className={'w-100 d-flex flex-row align-items-center justify-content-between'}>
        <div>
          <small>
            <IconFileText className={'me-1'} />
            {entry.fileName}
          </small>
          <br />
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
            onClick={deleteEntry}>
            <IconTrash />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
