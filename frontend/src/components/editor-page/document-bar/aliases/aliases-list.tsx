/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteDetails } from '../../../../hooks/common/use-note-details'
import { AliasesListEntry } from './aliases-list-entry'
import React, { Fragment, useMemo } from 'react'

/**
 * Renders the list of aliases.
 */
export const AliasesList: React.FC = () => {
  const aliases = useNoteDetails().aliases

  const aliasesDom = useMemo(() => {
    return aliases
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((alias) => <AliasesListEntry alias={alias} key={alias.name} />)
  }, [aliases])

  return <Fragment>{aliasesDom}</Fragment>
}
