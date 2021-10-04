/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react'
import Reveal from 'reveal.js'
import { Logger } from '../../../utils/logger'
import { SlideOptions } from '../../common/note-frontmatter/types'

const log = new Logger('reveal.js')

export const useReveal = (content: string, slideOptions?: SlideOptions): void => {
  const [deck, setDeck] = useState<Reveal>()
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  useEffect(() => {
    if (isInitialized) {
      return
    }
    setIsInitialized(true)
    log.debug('Initialize with slide options', slideOptions)
    const reveal = new Reveal({})
    reveal
      .initialize()
      .then(() => {
        reveal.layout()
        reveal.slide(0, 0, 0)
        setDeck(reveal)
        log.debug('Initialisation finished')
      })
      .catch((error) => {
        log.error('Error while initializing reveal.js', error)
      })
  }, [isInitialized, slideOptions])

  useEffect(() => {
    if (!deck) {
      return
    }
    log.debug('Sync deck')
    deck.layout()
  }, [content, deck])

  useEffect(() => {
    if (!deck || slideOptions === undefined || Object.keys(slideOptions).length === 0) {
      return
    }
    log.debug('Apply config', slideOptions)
    deck.configure(slideOptions)
  }, [deck, slideOptions])
}
