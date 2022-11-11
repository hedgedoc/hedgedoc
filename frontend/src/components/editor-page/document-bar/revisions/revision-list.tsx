/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { RevisionListEntry } from './revision-list-entry'
import { useAsync } from 'react-use'
import { getAllRevisions } from '../../../../api/revisions'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { ListGroup } from 'react-bootstrap'
import { AsyncLoadingBoundary } from '../../../common/async-loading-boundary'
import { DateTime } from 'luxon'

export interface RevisionListProps {
  selectedRevisionId?: number
  onRevisionSelect: (selectedRevisionId: number) => void
}

/**
 * The list of selectable revisions of the current note.
 *
 * @param selectedRevisionId The currently selected revision
 * @param onRevisionSelect Callback that is executed when a list entry is selected
 */
export const RevisionList: React.FC<RevisionListProps> = ({ selectedRevisionId, onRevisionSelect }) => {
  const noteIdentifier = useApplicationState((state) => state.noteDetails.primaryAddress)

  const {
    value: revisions,
    error,
    loading
  } = useAsync(() => {
    return getAllRevisions(noteIdentifier)
  }, [noteIdentifier])

  const revisionList = useMemo(() => {
    if (loading || !revisions) {
      return null
    }
    return revisions
      .sort((a, b) => {
        const timestampA = DateTime.fromISO(a.createdAt).toSeconds()
        const timestampB = DateTime.fromISO(b.createdAt).toSeconds()
        return timestampB - timestampA
      })
      .map((revisionListEntry) => (
        <RevisionListEntry
          active={selectedRevisionId === revisionListEntry.id}
          onSelect={() => onRevisionSelect(revisionListEntry.id)}
          revision={revisionListEntry}
          key={revisionListEntry.id}
        />
      ))
  }, [loading, onRevisionSelect, revisions, selectedRevisionId])

  return (
    <AsyncLoadingBoundary loading={loading} error={error} componentName={'revision list'}>
      <ListGroup>{revisionList}</ListGroup>
    </AsyncLoadingBoundary>
  )
}
