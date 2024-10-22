/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getNote } from '../../../api/notes'
import { redirect } from 'next/navigation'
import { baseUrlFromEnvExtractor } from '../../../utils/base-url-from-env-extractor'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { id: string | undefined }
}

/**
 * Redirects the user to the editor if the link is a root level direct link to a version 1 note.
 */
const DirectLinkFallback = async ({ params }: PageProps) => {
  const baseUrl = baseUrlFromEnvExtractor.extractBaseUrls().editor

  if (params.id === undefined) {
    notFound()
  }

  try {
    const noteData = await getNote(params.id, baseUrl)
    if (noteData.metadata.version !== 1) {
      notFound()
    }
  } catch {
    notFound()
  }

  redirect(`/n/${params.id}`)
}

export default DirectLinkFallback
