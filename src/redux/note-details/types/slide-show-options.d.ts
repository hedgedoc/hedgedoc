/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RevealOptions } from 'reveal.js'

type WantedRevealOptions = 'autoSlide' | 'autoSlideStoppable' | 'transition' | 'backgroundTransition' | 'slideNumber'

export type SlideOptions = Required<Pick<RevealOptions, WantedRevealOptions>>
