/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { mockAppState } from '../../../../test-utils/mock-app-state'
import { render } from '@testing-library/react'
import { EditorSettingsTabContent } from './editor-settings-tab-content'
import { mockI18n } from '../../../../test-utils/mock-i18n'

jest.mock('../../../../hooks/common/use-application-state')

describe('EditorSettingsTabContent', () => {
  beforeEach(async () => {
    await mockI18n()
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('renders space settings when indentWithTabs is false', () => {
    mockAppState({
      editorConfig: {
        syncScroll: false,
        spellCheck: false,
        smartPaste: false,
        lineWrapping: false,
        ligatures: false,
        indentWithTabs: false,
        indentSpaces: 7
      }
    })
    const view = render(<EditorSettingsTabContent />)
    expect(view.container).toMatchSnapshot()
  })

  it('hides space settings indentWithTabs is true', () => {
    mockAppState({
      editorConfig: {
        syncScroll: false,
        spellCheck: false,
        smartPaste: false,
        lineWrapping: false,
        ligatures: false,
        indentWithTabs: true,
        indentSpaces: 7
      }
    })
    const view = render(<EditorSettingsTabContent />)
    expect(view.container).toMatchSnapshot()
  })
})
