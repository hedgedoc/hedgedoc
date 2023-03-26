/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteDetails } from '../../../hooks/common/use-note-details'
import { useNoteTitle } from '../../../hooks/common/use-note-title'
import Head from 'next/head'
import React, { useMemo } from 'react'

/**
 * Returns the meta tags for the opengraph protocol as defined in the note frontmatter.
 */
export const OpengraphHead: React.FC = () => {
  const noteTitle = useNoteTitle()
  const openGraphData = useNoteDetails().frontmatter.opengraph
  const openGraphMetaElements = useMemo(() => {
    const elements = Object.entries(openGraphData)
      .filter(([, value]) => value && String(value).trim() !== '')
      .map(([key, value]) => <meta property={`og:${key}`} content={value} key={key} />)
    if (!('title' in openGraphData)) {
      elements.push(<meta property={'og:title'} content={noteTitle} key={'title'} />)
    }
    return elements
  }, [noteTitle, openGraphData])

  return <Head>{openGraphMetaElements}</Head>
}
