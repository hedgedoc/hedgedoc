/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { mockI18n } from '../../markdown-renderer/test-utils/mock-i18n'
import { render } from '@testing-library/react'
import { TranslatedIconButton } from './translated-icon-button'

describe('TranslatedIconButton', () => {
  it('renders heart icon with i18nKey', async () => {
    await mockI18n()
    const view = render(<TranslatedIconButton i18nKey={'testi18nKey'} icon={'heart'} />)
    expect(view.container).toMatchSnapshot()
  })
})
