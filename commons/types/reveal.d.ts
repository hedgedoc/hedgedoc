/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'reveal.js' {
  export interface RevealOptions {
    // Configuration
    controls?: boolean | undefined
    progress?: boolean | undefined
    // https://github.com/hakimel/reveal.js/#slide-number
    slideNumber?: boolean | string | undefined

    history?: boolean | undefined
    plugins?: Plugin[] | undefined

    // https://github.com/hakimel/reveal.js/#keyboard-bindings
    // keyboard?: any
    overview?: boolean | undefined
    center?: boolean | undefined
    touch?: boolean | undefined
    loop?: boolean | undefined
    rtl?: boolean | undefined
    shuffle?: boolean | undefined
    fragments?: boolean | undefined
    embedded?: boolean | undefined
    help?: boolean | undefined
    showNotes?: boolean | undefined
    autoSlide?: number | undefined
    autoSlideStoppable?: boolean | undefined
    //   autoSlideMethod?: any
    mouseWheel?: boolean | undefined
    hideAddressBar?: boolean | undefined
    previewLinks?: boolean | undefined
    transition?: string | undefined
    transitionSpeed?: string | undefined
    backgroundTransition?: string | undefined
    viewDistance?: number | undefined

    // https://github.com/hakimel/reveal.js/#parallax-background
    // Parallax background image
    parallaxBackgroundImage?: string | undefined

    // Parallax background size
    parallaxBackgroundSize?: string | undefined // CSS syntax, e.g. "2100px 900px" - currently only pixels are supported (don't use % or auto)

    // Number of pixels to move the parallax background per slide
    // - Calculated automatically unless specified
    // - Set to 0 to disable movement along an axis
    parallaxBackgroundHorizontal?: number | undefined
    parallaxBackgroundVertical?: number | undefined

    rollingLinks?: boolean | undefined
    theme?: string | undefined

    // Presentation Size
    // https://github.com/hakimel/reveal.js/#presentation-size
    width?: number | string | undefined
    height?: number | string | undefined
    margin?: number | string | undefined
    minScale?: number | string | undefined
    maxScale?: number | string | undefined

    // Dependencies
    // https://github.com/hakimel/reveal.js/#dependencies
    dependencies?: RevealDependency[] | undefined

    // Exposes the reveal.js API through window.postMessage
    postMessage?: boolean | undefined

    // Dispatches all reveal.js events to the parent window through postMessage
    postMessageEvents?: boolean | undefined

    // https://github.com/hakimel/reveal.js/#multiplexing
    multiplex?: MultiplexConfig | undefined

    // https://github.com/hakimel/reveal.js/#mathjax
    math?: MathConfig | undefined
  }

  // https://github.com/hakimel/reveal.js/#slide-changed-event
  export interface SlideEvent {
    previousSlide?: Element | undefined
    currentSlide: Element
    indexh: number
    indexv?: number | undefined
  }

  // https://github.com/hakimel/reveal.js/#fragment-events
  export interface FragmentEvent {
    fragment: Element
  }

  // https://github.com/hakimel/reveal.js/#multiplexing
  export interface MultiplexConfig {
    // Obtained from the socket.io server. Gives this (the master) control of the presentation
    secret?: string | undefined
    // Obtained from the socket.io server
    id: string

    // Location of socket.io server
    url: string
  }

  // https://github.com/hakimel/reveal.js/#mathjax
  export interface MathConfig {
    // Obtained from the socket.io server. Gives this (the master) control of the presentation
    mathjax: string
    // Obtained from the socket.io server
    config: string
  }

  // https://github.com/hakimel/reveal.js/#dependencies
  export interface RevealDependency {
    src: string
    condition?: (() => boolean) | undefined
    async?: boolean | undefined
    callback?: (() => void) | undefined
  }

  export interface Plugin {
    id: string

    init(deck: Reveal): void | Promise<void>
  }

  export default class Reveal {
    constructor(options: RevealOptions)

    initialize: (options?: { url?: string }) => Promise<void>

    public configure: (diff: RevealOptions) => void

    public destroy: () => void

    // Navigation
    public slide(indexh: number, indexv?: number, f?: number, o?: number): void

    public left(): void

    public right(): void

    public up(): void

    public down(): void

    public prev(): void

    public next(): void

    public prevFragment(): boolean

    public nextFragment(): boolean

    // Randomize the order of slides
    public shuffle(): void

    // Toggle presentation states
    public toggleOverview(override?: boolean): void

    public togglePause(override?: boolean): void

    public toggleAutoSlide(override?: boolean): void

    // Retrieves the previous and current slide elements
    public getPreviousSlide(): Element

    public getCurrentSlide(): Element

    public getIndices(slide?: Element): { h: number; v: number }

    public getProgress(): number

    public getTotalSlides(): number

    public availableFragments(): { prev: boolean; next: boolean }

    // Returns the speaker notes for the current slide
    public getSlideNotes(slide?: Element): string

    // Plugins
    public hasPlugin(name: string): boolean

    public getPlugin(name: string): Plugin

    public getPlugins(): { [name: string]: Plugin }

    // States
    // Added only the events we need
    public addEventListener(
      type: 'slidechanged',
      listener: (event: SlideEvent) => void,
      useCapture?: boolean
    ): void
    public removeEventListener(
      type: 'slidechanged',
      listener: (event: SlideEvent) => void,
      useCapture?: boolean
    ): void

    // State Checks
    public isFirstSlide(): boolean

    public isLastSlide(): boolean

    public isPaused(): boolean

    public isOverview(): boolean

    public isAutoSliding(): boolean

    // undocumented method
    public layout(): void

    public addEventListeners(): void

    public removeEventListeners(): void

    public getSlide(x: number, y?: number): Element

    public getScale(): number

    public getConfig(): RevealOptions

    //  public getQueryHash(): any

    //  public setState(state: any): void

    // public getState(): any

    // update slides after dynamic changes
    public sync(): void
  }
}

// [1]: Implement ourself can only modify the iframe url
