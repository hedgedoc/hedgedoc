/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getNote } from '../api/notes'
import { Redirect } from '../components/common/redirect'
import { useSingleStringUrlParameter } from '../hooks/common/use-single-string-url-parameter'
import Custom404 from './404'
import type { NextPage } from 'next'
import React from 'react'
import { useAsync } from 'react-use'

/**
 * Redirects the user to the editor if the link is a root level direct link to a version 1 note.
 */
export const DirectLinkFallback: NextPage = () => {
  const id = useSingleStringUrlParameter('id', undefined)

  const { error, value } = useAsync(async () => {
    if (id === undefined) {
      throw new Error('No note id found in path')
    }
    const noteData = await getNote(id)
    if (noteData.metadata.version !== 1) {
      throw new Error('Note is not a version 1 note')
    }
    return id
  })

  if (error !== undefined) {
    return <Custom404 />
  } else if (value !== undefined) {
    return <Redirect to={`/n/${value}`} />
  } else {
    return <span>Loading</span>
  }
}

export default DirectLinkFallback
