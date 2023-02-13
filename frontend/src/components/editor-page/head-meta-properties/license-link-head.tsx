/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import Head from 'next/head'
import React, { useMemo } from 'react'

/**
 * Renders the license link tag if a license is set in the frontmatter.
 */
export const LicenseLinkHead: React.FC = () => {
  const license = useApplicationState((state) => state.noteDetails.frontmatter.license)

  const optionalLinkElement = useMemo(() => {
    if (!license || license.trim() === '') {
      return null
    }
    return <link rel={'license'} href={license} />
  }, [license])

  return <Head>{optionalLinkElement}</Head>
}
