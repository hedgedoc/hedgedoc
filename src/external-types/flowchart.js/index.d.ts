declare module 'flowchart.js' {
  export interface Options {
    'line-width': number,
    'fill': string,
    'font-size': string,
    'font-family': string
  }
  export interface ParseOutput {
    clean: () => void,
    drawSVG: (container: HTMLElement, options: Options) => void,
  }
  export function parse(code: string): ParseOutput
}
