/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import type { Alias } from '../../../../../../api/alias/types'
import type { ApplicationState } from '../../../../../../redux'
import { AliasesListEntry } from './aliases-list-entry'
import React, { Fragment, useMemo } from 'react'

/**
 * Renders the list of aliases.
 */
export const AliasesList: React.FC = () => {
  const aliases = useApplicationState((state: ApplicationState) => state.noteDetails?.aliases)
  const aliasesDom = useMemo(() => {
    return aliases === undefined
      ? null
      : Object.assign([], aliases)
          .sort((a: Alias, b: Alias) => a.name.localeCompare(b.name))
          .map((alias: Alias) => <AliasesListEntry alias={alias} key={alias.name} />)
  }, [aliases])

  return <Fragment>{aliasesDom}</Fragment>
}
