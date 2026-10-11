/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { notFound } from 'next/navigation'
import type { NextPage } from 'next'
import { AccountTab } from '../../../../components/preferences-page/account/account-tab'
import { ApiTab } from '../../../../components/preferences-page/api/api-tab'
import { ProfileTab } from '../../../../components/preferences-page/profile/profile-tab'
import { AppearanceTab } from '../../../../components/preferences-page/appearance/appearance-tab'
import { EditorSettingsTabContent } from '../../../../components/preferences-page/editor/editor-settings-tab-content'

export interface TabParam {
  tab: string
}

interface PreferencesTabPageProps {
  params: TabParam
}

/**
 * Renders the preferences tab selected by the URL.
 * @param params The URL placeholders, including the requested tab.
 */
const PreferencesTabPage: NextPage<PreferencesTabPageProps> = ({ params }) => {
  switch (params.tab) {
    case 'appearance':
      return <AppearanceTab />
    case 'editor':
      return <EditorSettingsTabContent />
    case 'profile':
      return <ProfileTab />
    case 'account':
      return <AccountTab />
    case 'api':
      return <ApiTab />
    default:
      notFound()
  }
}

export default PreferencesTabPage
