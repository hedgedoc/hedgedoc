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
import { Optional } from '@mrdrogdrog/optional'
import { applyPatch, parsePatch } from 'diff'
import React, { useMemo } from 'react'
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

  const { value, error, loading } = useAsync(async () => {
    if (noteId === undefined || selectedRevisionId === undefined) {
      throw new Error('No revision selected')
    } else {
      return await getRevision(noteId, selectedRevisionId)
    }
  }, [selectedRevisionId, noteId])

  const previousRevisionContent = useMemo(() => {
    return Optional.ofNullable(value)
      .flatMap((revision) =>
        Optional.ofNullable(parsePatch(revision.patch)[0])
          .map((patch) => invertUnifiedPatch(patch))
          .map((patch) => applyPatch(revision.content, patch))
      )
      .orElse('')
  }, [value])

  if (selectedRevisionId === undefined) {
    return null
  }

  return (
    <AsyncLoadingBoundary loading={loading || !value} componentName={'RevisionViewer'} error={error}>
      <ReactDiffViewer
        oldValue={previousRevisionContent ?? ''}
        newValue={value?.content ?? ''}
        splitView={false}
        compareMethod={DiffMethod.WORDS}
        useDarkTheme={darkModeEnabled}
      />
    </AsyncLoadingBoundary>
  )
}
