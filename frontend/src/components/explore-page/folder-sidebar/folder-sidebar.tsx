'use client'
/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form, ListGroup, Modal } from 'react-bootstrap'
import { createFolder, deleteFolder, getFolders, updateFolder } from '../../../api/folders'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import type { FolderInterface } from '@hedgedoc/commons'
import {
  Folder as IconFolder,
  FolderPlus as IconFolderPlus,
  House as IconHouse,
  PencilSquare as IconPencilSquare,
  Trash as IconTrash,
  ChevronRight as IconChevronRight,
} from 'react-bootstrap-icons'
import { UiIcon } from '../../common/icons/ui-icon'

export interface FolderSidebarProps {
  selectedFolderId: number | null
  onSelectFolder: (folderId: number | null) => void
}

/**
 * Renders a sidebar showing the user's folders for organizing notes.
 */
export const FolderSidebar: React.FC<FolderSidebarProps> = ({ selectedFolderId, onSelectFolder }) => {
  const [folders, setFolders] = useState<FolderInterface[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderInterface | null>(null)
  const [editName, setEditName] = useState('')
  const { showErrorNotificationBuilder } = useUiNotifications()

  const loadFolders = useCallback(() => {
    getFolders()
      .then(setFolders)
      .catch(showErrorNotificationBuilder('Failed to load folders'))
  }, [showErrorNotificationBuilder])

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  const handleCreateFolder = useCallback(() => {
    if (isCreatingFolder || !newFolderName.trim()) return

    const normalizedName = newFolderName.trim().toLowerCase()
    const duplicate = folders.find(
      (folder) =>
        folder.parentFolderId === selectedFolderId && folder.name.trim().toLowerCase() === normalizedName
    )
    if (duplicate) {
      // Avoid accidental duplicate creation (double submit, repeated clicks, etc.).
      setShowCreateModal(false)
      setNewFolderName('')
      onSelectFolder(duplicate.id)
      return
    }

    setIsCreatingFolder(true)
    createFolder(newFolderName.trim(), selectedFolderId)
      .then(() => {
        setNewFolderName('')
        setShowCreateModal(false)
        loadFolders()
      })
      .catch(showErrorNotificationBuilder('Failed to create folder'))
      .finally(() => setIsCreatingFolder(false))
  }, [isCreatingFolder, newFolderName, folders, selectedFolderId, onSelectFolder, loadFolders, showErrorNotificationBuilder])

  const handleDeleteFolder = useCallback(
    (folderId: number) => {
      if (!window.confirm('Delete this folder? Notes inside will be moved to root.')) return
      deleteFolder(folderId)
        .then(() => {
          if (selectedFolderId === folderId) {
            onSelectFolder(null)
          }
          loadFolders()
        })
        .catch(showErrorNotificationBuilder('Failed to delete folder'))
    },
    [selectedFolderId, onSelectFolder, loadFolders, showErrorNotificationBuilder]
  )

  const handleRenameFolder = useCallback(() => {
    if (!editingFolder || !editName.trim()) return
    updateFolder(editingFolder.id, { name: editName.trim() })
      .then(() => {
        setEditingFolder(null)
        setEditName('')
        loadFolders()
      })
      .catch(showErrorNotificationBuilder('Failed to rename folder'))
  }, [editingFolder, editName, loadFolders, showErrorNotificationBuilder])

  // Separate root folders and sub-folders of selected
  const rootFolders = useMemo(() => {
    return folders.filter((f) => f.parentFolderId === null)
  }, [folders])

  const childFolders = useMemo(() => {
    if (selectedFolderId === null) return []
    return folders.filter((f) => f.parentFolderId === selectedFolderId)
  }, [folders, selectedFolderId])

  const displayFolders = selectedFolderId === null ? rootFolders : childFolders

  // Breadcrumb: find path from root to selected
  const breadcrumb = useMemo(() => {
    const path: FolderInterface[] = []
    let currentId = selectedFolderId
    while (currentId !== null) {
      const folder = folders.find((f) => f.id === currentId)
      if (!folder) break
      path.unshift(folder)
      currentId = folder.parentFolderId
    }
    return path
  }, [folders, selectedFolderId])

  return (
    <div className={'mb-3'}>
      {/* Breadcrumb navigation */}
      <div className={'d-flex align-items-center gap-1 mb-2 flex-wrap'}>
        <Button
          variant={selectedFolderId === null ? 'primary' : 'outline-secondary'}
          size={'sm'}
          onClick={() => onSelectFolder(null)}>
          <UiIcon icon={IconHouse} className={'me-1'} />
          All Notes
        </Button>
        {breadcrumb.map((folder) => (
          <React.Fragment key={folder.id}>
            <UiIcon icon={IconChevronRight} />
            <Button
              variant={selectedFolderId === folder.id ? 'primary' : 'outline-secondary'}
              size={'sm'}
              onClick={() => onSelectFolder(folder.id)}>
              <UiIcon icon={IconFolder} className={'me-1'} />
              {folder.name}
            </Button>
          </React.Fragment>
        ))}
        <Button
          variant={'outline-success'}
          size={'sm'}
          className={'ms-auto'}
          onClick={() => setShowCreateModal(true)}>
          <UiIcon icon={IconFolderPlus} className={'me-1'} />
          New Folder
        </Button>
      </div>

      {/* Folder list */}
      {displayFolders.length > 0 && (
        <ListGroup horizontal className={'mb-2 flex-wrap gap-1'}>
          {displayFolders.map((folder) => (
            <ListGroup.Item
              key={folder.id}
              active={selectedFolderId === folder.id}
              action
              onClick={() => onSelectFolder(folder.id)}
              className={'d-flex align-items-center gap-2 border rounded'}>
              <UiIcon icon={IconFolder} />
              <span className={'flex-grow-1'}>{folder.name}</span>
              <Button
                variant={'link'}
                size={'sm'}
                className={'p-0 text-muted'}
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingFolder(folder)
                  setEditName(folder.name)
                }}>
                <UiIcon icon={IconPencilSquare} />
              </Button>
              <Button
                variant={'link'}
                size={'sm'}
                className={'p-0 text-danger'}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFolder(folder.id)
                }}>
                <UiIcon icon={IconTrash} />
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Create Folder Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Folder Name</Form.Label>
            <Form.Control
              type={'text'}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={'Enter folder name'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateFolder()
                }
              }}
              autoFocus
            />
          </Form.Group>
          {selectedFolderId !== null && (
            <Form.Text className={'text-muted'}>
              Will be created inside: {breadcrumb.map((f) => f.name).join(' / ')}
            </Form.Text>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant={'secondary'} onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant={'primary'} onClick={handleCreateFolder} disabled={!newFolderName.trim() || isCreatingFolder}>
            {isCreatingFolder ? 'Creating...' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal show={editingFolder !== null} onHide={() => setEditingFolder(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rename Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>New Name</Form.Label>
            <Form.Control
              type={'text'}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameFolder()
              }}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={'secondary'} onClick={() => setEditingFolder(null)}>
            Cancel
          </Button>
          <Button variant={'primary'} onClick={handleRenameFolder} disabled={!editName.trim()}>
            Rename
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
