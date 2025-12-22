/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, type MouseEvent } from 'react'
import { Badge } from 'react-bootstrap'

export interface NoteTagsProps {
  tags: string[]
  onClickTag?: (tag: string) => void
  hoverLabel?: string
}

/**
 * Renders a list of tags for a note.
 *
 * @param tags The list of tags as strings
 * @param onClickTag Callback for when a tag is clicked
 * @param hoverLabel A different label for hover tooltips
 */
export const NoteTags: React.FC<NoteTagsProps> = ({ tags, onClickTag, hoverLabel }) => {
  const onMouseEvent = useCallback(
    (tag: string) => (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      onClickTag?.(tag)
    },
    [onClickTag]
  )

  if (tags.length === 0) {
    return null
  }

  return tags.map((tag) => (
    <Badge key={tag} bg={'secondary'} pill={true} className={'me-1'} onClick={onMouseEvent(tag)} title={hoverLabel}>
      {tag}
    </Badge>
  ))
}
