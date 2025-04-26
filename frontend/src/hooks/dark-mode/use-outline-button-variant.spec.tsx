/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as UseDarkModeStateModule from './use-dark-mode-state'
import { useOutlineButtonVariant } from './use-outline-button-variant'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, vitest } from 'vitest'
import { vi } from 'vitest'

vi.mock('./use-dark-mode-state')

describe('useOutlineButtonVariant', () => {
  const TestComponent: React.FC = () => {
    return useOutlineButtonVariant()
  }

  it('returns the correct variant for dark mode', async () => {
    vitest.spyOn(UseDarkModeStateModule, 'useDarkModeState').mockReturnValue(true)
    render(<TestComponent />)
    await screen.findByText('outline-light')
  })

  it('returns the correct variant for light mode', async () => {
    vitest.spyOn(UseDarkModeStateModule, 'useDarkModeState').mockReturnValue(false)
    render(<TestComponent />)
    await screen.findByText('outline-dark')
  })
})
