export interface ScrollProps {
  scrollState?: ScrollState
  onScroll?: (scrollState: ScrollState) => void
  onMakeScrollSource?: () => void
}

export interface ScrollState {
  firstLineInView: number
  scrolledPercentage: number
}

export interface DualScrollState {
  editorScrollState: ScrollState
  rendererScrollState: ScrollState
}
