'use client'
/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NextPage } from 'next'
import { ExploreNotesSection } from '../../../../components/explore-page/explore-notes-section/explore-notes-section'
import { Mode } from '../../../../components/explore-page/mode-selection/mode'
import { FolderSidebar } from '../../../../components/explore-page/folder-sidebar/folder-sidebar'
import { useMemo } from 'react'
import { useUrlParamState } from '../../../../hooks/common/use-url-param-state'

const ExploreMyNotesPage: NextPage = () => {
  const [selectedFolderIdParam, setSelectedFolderIdParam] = useUrlParamState<string | null>('folder', null)
  const selectedFolderId = useMemo(() => {
    if (selectedFolderIdParam === null) {
      return null
    }
    const parsed = Number.parseInt(selectedFolderIdParam, 10)
    return Number.isNaN(parsed) ? null : parsed
  }, [selectedFolderIdParam])

  const setSelectedFolderId = (folderId: number | null) => {
    setSelectedFolderIdParam(folderId === null ? null : String(folderId))
  }

  return (
    <>
      <FolderSidebar selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />
      <ExploreNotesSection mode={Mode.MY_NOTES} folderId={selectedFolderId} />
    </>
  )
}

export default ExploreMyNotesPage
