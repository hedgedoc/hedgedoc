/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getRevision } from '../../../../../../api/revisions'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { useDarkModeState } from '../../../../../../hooks/dark-mode/use-dark-mode-state'
import { AsyncLoadingBoundary } from '../../../../../common/async-loading-boundary/async-loading-boundary'
import { invertUnifiedPatch } from './invert-unified-patch'
import { applyPatch, parsePatch } from 'diff'
import React, { Fragment, useMemo } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import { useAsync } from 'react-use'

export interface RevisionViewerProps {
  selectedRevisionId?: number
}

/**
 * Renders the diff viewer for a given revision and its previous one.
 *
 * @param selectedRevisionId The id of the currently selected revision.
 * @param allRevisions List of metadata for all available revisions.
 */
export const RevisionViewer: React.FC<RevisionViewerProps> = ({ selectedRevisionId }) => {
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const darkModeEnabled = useDarkModeState()

  const {
    value: revision,
    error,
    loading
  } = useAsync(async () => {
    if (noteId && selectedRevisionId !== undefined) {
      return await getRevision(noteId, selectedRevisionId)
    }
  }, [selectedRevisionId, noteId])

  const previousRevisionContent = useMemo(() => {
    if (revision === undefined) {
      return ''
    }
    const patches = parsePatch(revision.patch)
    if (patches.length === 0) {
      return ''
    }
    const inversePatch = invertUnifiedPatch(patches[0])
    return applyPatch(revision.content, inversePatch) || ''
  }, [revision])

  if (!noteId || selectedRevisionId === undefined) {
    return <Fragment />
  }

  return (
    <AsyncLoadingBoundary loading={loading || !revision} componentName={'RevisionViewer'} error={error}>
      <ReactDiffViewer
        oldValue={previousRevisionContent}
        newValue={revision?.content ?? ''}
        splitView={false}
        compareMethod={DiffMethod.WORDS}
        useDarkTheme={darkModeEnabled}
      />
    </AsyncLoadingBoundary>
  )
}
