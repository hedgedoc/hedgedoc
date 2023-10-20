/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { useBaseUrl } from '../../../../../../hooks/common/use-base-url'
import { CopyableField } from '../../../../../common/copyable/copyable-field/copyable-field'
import React, { useMemo } from 'react'

export enum LinkType {
  EDITOR = 'n',
  SLIDESHOW = 'p',
  DOCUMENT = 's'
}

export interface LinkFieldProps {
  type: LinkType
}

/**
 * Renders a specific URL to the current note.
 * @param type defines the URL type. (editor, read only document, slideshow, etc.)
 */
export const NoteUrlField: React.FC<LinkFieldProps> = ({ type }) => {
  const baseUrl = useBaseUrl()
  const noteId = useApplicationState((state) => state.noteDetails?.id)

  const url = useMemo(() => {
    if (noteId === undefined) {
      return null
    }
    const url = new URL(baseUrl)
    url.pathname += `${type}/${noteId}`
    return url.toString()
  }, [baseUrl, noteId, type])

  return !url ? null : <CopyableField content={url} shareOriginUrl={url} />
}
