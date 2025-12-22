/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react'
import {
  FileEarmarkSlidesFill as IconFileEarmarkSlidesFill,
  FileEarmarkTextFill as IconFileEarmarkTextFill
} from 'react-bootstrap-icons'
import { NoteType } from '@hedgedoc/commons'
import { UiIcon } from '../icons/ui-icon'
import type { UiIconProps } from '../icons/ui-icon'

interface NoteTypeIconProps extends Omit<UiIconProps, 'icon'> {
  noteType: NoteType
}

/**
 * Renders an icon for a given note type.
 *
 * @param noteType The note type to render the icon for.
 * @param props Additional props passed to the icon.
 */
export const NoteTypeIcon: React.FC<NoteTypeIconProps> = ({ noteType, ...props }) => {
  const icon = useMemo(() => {
    switch (noteType) {
      case NoteType.DOCUMENT:
      default:
        return IconFileEarmarkTextFill
      case NoteType.SLIDE:
        return IconFileEarmarkSlidesFill
    }
  }, [noteType])

  return <UiIcon icon={icon} {...props} />
}
