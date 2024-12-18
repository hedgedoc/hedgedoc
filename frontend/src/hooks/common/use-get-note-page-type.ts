/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export enum NotePageType {
  EDITOR = 'n',
  PRESENTATION = 'p',
  READ_ONLY = 's'
}

/**
 * Gets the type of the currently loaded note page. This is determined by the first part of the URL path.
 * If the page is not a note page, this function returns `null`.
 *
 * @return The type of the currently loaded note page or `null` if the page is not a note page.
 */
export const useGetNotePageType = (): NotePageType | null => {
  const pathName = usePathname()

  return useMemo(() => {
    let pathNamePrefix = pathName?.split('/')[1] ?? null

    if (pathNamePrefix === 'render') {
      const topPathName = window.top?.location?.pathname
      pathNamePrefix = topPathName?.split('/')[1] ?? null
    }

    if (pathNamePrefix === null) {
      return null
    }

    switch (pathNamePrefix) {
      case 'n':
        return NotePageType.EDITOR
      case 'p':
        return NotePageType.PRESENTATION
      case 's':
        return NotePageType.READ_ONLY
      default:
        return null
    }
  }, [pathName])
}
