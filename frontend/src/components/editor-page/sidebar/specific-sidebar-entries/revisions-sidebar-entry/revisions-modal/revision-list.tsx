/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RevisionMetadataDto } from '@hedgedoc/commons'
import { cypressId } from '../../../../../../utils/cypress-attribute'
import { AsyncLoadingBoundary } from '../../../../../common/async-loading-boundary/async-loading-boundary'
import { RevisionListEntry } from './revision-list-entry'
import { DateTime } from 'luxon'
import React, { useMemo } from 'react'
import { ListGroup } from 'react-bootstrap'

interface RevisionListProps {
  selectedRevisionId?: number
  revisions?: RevisionMetadataDto[]
  loadingRevisions: boolean
  error?: Error | boolean
  onRevisionSelect: (selectedRevisionId: number) => void
}

/**
 * The list of selectable revisions of the current note.
 *
 * @param selectedRevisionId The currently selected revision
 * @param onRevisionSelect Callback that is executed when a list entry is selected
 * @param revisions List of all the revisions
 * @param error Indicates an error occurred
 * @param loadingRevisions Boolean for showing loading state
 */
export const RevisionList: React.FC<RevisionListProps> = ({
  selectedRevisionId,
  onRevisionSelect,
  revisions,
  loadingRevisions,
  error
}) => {
  const revisionList = useMemo(() => {
    if (loadingRevisions || !revisions) {
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
  }, [loadingRevisions, onRevisionSelect, revisions, selectedRevisionId])

  return (
    <AsyncLoadingBoundary loading={loadingRevisions || !revisions} error={error} componentName={'revision list'}>
      <ListGroup {...cypressId('revision.modal.lists')}>{revisionList}</ListGroup>
    </AsyncLoadingBoundary>
  )
}
