declare module 'flowchart.js' {
  export interface Options {
    'line-width': number,
    'fill': string,
    'font-size': string,
    'font-family': string,
    'font-color': string,
    'line-color': string,
    'element-color': string
  }
  export interface ParseOutput {
    clean: () => void,
    drawSVG: (container: HTMLElement, options: Partial<Options>) => void,
  }
  export function parse(code: string): ParseOutput
}
