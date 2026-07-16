/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../../utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'
import type Reveal from 'reveal.js'
import type { RevealOptions } from 'reveal.js'

const log = new Logger('reveal.js')
const printDelay = 100

const cleanupRevealPrintMode = (): void => {
  document.documentElement.classList.remove('reveal-print', 'print-pdf')
  document.body.style.removeProperty('width')
  document.body.style.removeProperty('height')
}

export enum REVEAL_STATUS {
  NOT_INITIALISED,
  INITIALISING,
  INITIALISED
}

export interface SlideState {
  indexHorizontal: number
  indexVertical: number
}

const initialSlideState: SlideState = {
  indexHorizontal: 0,
  indexVertical: 0
}
/**
 * Initialize reveal.js and renders the document as a reveal.js presentation.
 *
 * @param markdownContentLines An array of markdown lines.
 * @param slideOptions The slide options.
 * @param targetSlideState The slide that should be shown.
 * @param printMode Defines if the presentation should be printed.
 * @param onPrintModeConsumed Callback to reset print mode after printing.
 * @return The current state of reveal.js
 * @see https://revealjs.com/
 */
export const useReveal = (
  markdownContentLines: string[],
  slideOptions?: RevealOptions,
  targetSlideState?: SlideState,
  printMode = false,
  onPrintModeConsumed?: () => void
): REVEAL_STATUS => {
  const [deck, setDeck] = useState<Reveal>()
  const [revealStatus, setRevealStatus] = useState<REVEAL_STATUS>(REVEAL_STATUS.NOT_INITIALISED)
  const currentSlideState = useRef<SlideState>(initialSlideState)
  const printInProgress = useRef<boolean>(false)

  useEffect(() => {
    if (revealStatus !== REVEAL_STATUS.NOT_INITIALISED) {
      return
    }
    setRevealStatus(REVEAL_STATUS.INITIALISING)
    log.debug('Initialize with slide options', slideOptions)
    const revealOptions: RevealOptions = printMode ? { ...slideOptions, view: 'print' } : (slideOptions ?? {})

    import(/* webpackChunkName: "reveal" */ 'reveal.js')
      .then((revealImport) => {
        const reveal = new revealImport.default(revealOptions)
        reveal
          .initialize()
          .then(() => {
            reveal.layout()
            reveal.slide(0, 0, 0)
            reveal.addEventListener('slidechanged', (event) => {
              currentSlideState.current = {
                indexHorizontal: event.indexh,
                indexVertical: event.indexv ?? 0
              } as SlideState
            })

            setDeck(reveal)
            setRevealStatus(REVEAL_STATUS.INITIALISED)
            log.debug('Initialisation finished')
          })
          .catch((error: Error) => {
            log.error('Error while initializing reveal.js', error)
          })
      })
      .catch((error: Error) => {
        log.error('Error while loading reveal.js', error)
      })
  }, [printMode, revealStatus, slideOptions])

  useEffect(() => {
    if (!deck) {
      return
    }

    return () => {
      deck.destroy()
      if (printMode) {
        cleanupRevealPrintMode()
      }
    }
  }, [deck, printMode])

  useEffect(() => {
    if (!deck || printMode || revealStatus !== REVEAL_STATUS.INITIALISED) {
      return
    }
    log.debug('Sync deck')
    deck.sync()
    deck.slide(currentSlideState.current.indexHorizontal, currentSlideState.current.indexVertical)
  }, [markdownContentLines, deck, printMode, revealStatus])

  useEffect(() => {
    if (
      !deck ||
      printMode ||
      slideOptions === undefined ||
      Object.keys(slideOptions).length === 0 ||
      revealStatus !== REVEAL_STATUS.INITIALISED
    ) {
      return
    }
    log.debug('Apply config', slideOptions)
    deck.configure(slideOptions)
  }, [deck, printMode, revealStatus, slideOptions])

  useEffect(() => {
    if (!deck || printMode || targetSlideState === undefined || revealStatus !== REVEAL_STATUS.INITIALISED) {
      return
    }
    deck.slide(targetSlideState.indexHorizontal, targetSlideState.indexVertical)
  }, [deck, printMode, revealStatus, targetSlideState])

  const printPresentation = useCallback(async () => {
    if (!deck || revealStatus !== REVEAL_STATUS.INITIALISED || printInProgress.current) {
      return
    }
    printInProgress.current = true

    const finishPrint = (): void => {
      window.removeEventListener('afterprint', finishPrint)
      cleanupRevealPrintMode()
      onPrintModeConsumed?.()
      printInProgress.current = false
    }

    setTimeout(() => {
      try {
        window.addEventListener('afterprint', finishPrint)
        window.print()
      } catch (error) {
        log.error('Error while printing reveal.js presentation', error)
        finishPrint()
      }
    }, printDelay)
  }, [deck, onPrintModeConsumed, revealStatus])

  useEffect(() => {
    if (printMode) {
      void printPresentation()
    }
  }, [printMode, printPresentation])

  return revealStatus
}
