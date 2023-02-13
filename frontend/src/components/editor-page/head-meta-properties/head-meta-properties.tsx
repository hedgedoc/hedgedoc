/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LicenseLinkHead } from './license-link-head'
import { NoteAndAppTitleHead } from './note-and-app-title-head'
import { OpengraphHead } from './opengraph-head'
import React, { Fragment } from 'react'

/**
 * Renders all HTML head tags that should be present for a note.
 */
export const HeadMetaProperties: React.FC = () => {
  return (
    <Fragment>
      <NoteAndAppTitleHead />
      <OpengraphHead />
      <LicenseLinkHead />
    </Fragment>
  )
}
