/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextPage } from 'next'
import { ExploreNotesSection } from '../../../../components/explore-page/explore-notes-section/explore-notes-section'
import { Mode } from '../../../../components/explore-page/mode-selection/mode'

const ExploreSharedPage: NextPage = () => {
  return <ExploreNotesSection mode={Mode.SHARED_WITH_ME} />
}

export default ExploreSharedPage
