/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import { useAsync } from 'react-use'
import { getRevision } from '../../../../api/revisions'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { useIsDarkModeActivated } from '../../../../hooks/common/use-is-dark-mode-activated'
import { AsyncLoadingBoundary } from '../../../common/async-loading-boundary'
import { applyPatch, parsePatch } from 'diff'
import { invertUnifiedPatch } from './invert-unified-patch'
import { Optional } from '@mrdrogdrog/optional'

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
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)
  const darkModeEnabled = useIsDarkModeActivated()

  const { value, error, loading } = useAsync(async () => {
    if (selectedRevisionId === undefined) {
      throw new Error('No revision selected')
    } else {
      return await getRevision(noteIdentifier, selectedRevisionId)
    }
  }, [selectedRevisionId, noteIdentifier])

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
    <AsyncLoadingBoundary loading={loading} componentName={'RevisionViewer'} error={error}>
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
