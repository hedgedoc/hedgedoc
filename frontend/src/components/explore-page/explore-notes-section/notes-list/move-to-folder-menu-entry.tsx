'use client'
/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Dropdown, Form, Modal } from 'react-bootstrap'
import { getFolders, moveNoteToFolder, removeNoteFromFolder } from '../../../../api/folders'
import type { FolderInterface } from '@hedgedoc/commons'
import { Folder as IconFolder } from 'react-bootstrap-icons'
import { UiIcon } from '../../../common/icons/ui-icon'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'

export interface MoveToFolderMenuEntryProps {
  noteAlias: string
  currentFolderId: number | null
  onMoved?: () => void
}

/**
 * Renders a dropdown menu entry that opens a modal to move a note to a folder.
 */
export const MoveToFolderMenuEntry: React.FC<MoveToFolderMenuEntryProps> = ({
  noteAlias,
  currentFolderId,
  onMoved,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [folders, setFolders] = useState<FolderInterface[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(currentFolderId)
  const { showErrorNotificationBuilder } = useUiNotifications()

  useEffect(() => {
    if (showModal) {
      getFolders()
        .then(setFolders)
        .catch(showErrorNotificationBuilder('Failed to load folders'))
    }
  }, [showModal, showErrorNotificationBuilder])

  const handleMove = useCallback(() => {
    const action =
      selectedFolderId === null
        ? removeNoteFromFolder(noteAlias)
        : moveNoteToFolder(noteAlias, selectedFolderId)

    action
      .then(() => {
        setShowModal(false)
        onMoved?.()
      })
      .catch(showErrorNotificationBuilder('Failed to move note'))
  }, [selectedFolderId, noteAlias, onMoved, showErrorNotificationBuilder])

  return (
    <>
      <Dropdown.Item onClick={() => setShowModal(true)}>
        <UiIcon icon={IconFolder} className={'me-2'} />
        Move to folder
      </Dropdown.Item>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Move Note to Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Folder</Form.Label>
            <Form.Select
              value={selectedFolderId ?? ''}
              onChange={(e) => {
                const val = e.target.value
                setSelectedFolderId(val === '' ? null : parseInt(val, 10))
              }}>
              <option value={''}>Root (No folder)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={'secondary'} onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant={'primary'} onClick={handleMove}>
            Move
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
