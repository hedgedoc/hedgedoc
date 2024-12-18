/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CopyableField } from '../../../../../common/copyable/copyable-field/copyable-field'
import React from 'react'
import { useNoteLinks } from '../../../../../../hooks/common/use-note-links'
import type { NotePageType } from '../../../../../../hooks/common/use-get-note-page-type'

export interface LinkFieldProps {
  type: NotePageType
}

/**
 * Renders a specific URL to the current note.
 * @param type defines the URL type. (editor, read only document, slideshow, etc.)
 */
export const NoteUrlField: React.FC<LinkFieldProps> = ({ type }) => {
  const noteLinks = useNoteLinks()
  const url = noteLinks[type]
  return !url ? null : <CopyableField content={url} shareOriginUrl={url} />
}
