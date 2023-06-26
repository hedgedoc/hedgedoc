/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ClickShieldProps } from '../../../components/markdown-renderer/replace-components/click-shield/click-shield'
import * as ClickShieldModule from '../../../components/markdown-renderer/replace-components/click-shield/click-shield'
import { VimeoFrame } from './vimeo-frame'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('../../../components/markdown-renderer/replace-components/click-shield/click-shield')

describe('VimeoFrame', () => {
  beforeEach(() => {
    jest.spyOn(ClickShieldModule, 'ClickShield').mockImplementation((({ children }) => {
      return <span>This is a click shield for {children}</span>
    }) as React.FC<ClickShieldProps>)
  })

  it('renders a click shield', () => {
    const view = render(<VimeoFrame id={'validVimeoId'} />)
    expect(view.container).toMatchSnapshot()
  })
})
