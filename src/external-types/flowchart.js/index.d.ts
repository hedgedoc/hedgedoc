declare module 'flowchart.js' {
  type Options = {
    'line-width': number,
    'fill': string,
    'font-size': string,
    'font-family': string
  }
  type ParseOutput = {
    clean: () => void,
    drawSVG: (container: HTMLElement, options: Options) => void,
  }
  export const parse: (code: string) => ParseOutput
}
