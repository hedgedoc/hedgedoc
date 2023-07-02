/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBrandingDetails } from '../../../common/custom-branding/use-branding-details'
import React from 'react'

/**
 * Renders a long dash if branding is configured.
 */
export const BrandingSeparatorDash: React.FC = () => {
  const branding = useBrandingDetails()

  return !branding ? null : <span className={'mx-1'}>&mdash;</span>
}
