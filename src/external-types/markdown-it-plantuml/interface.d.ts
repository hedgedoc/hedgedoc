import Renderer from 'markdown-it/lib/renderer'

export interface PlantumlOptions {
  openMarker: string
  closeMarker: string
  render: Renderer
  generateSource: (umlCode: string, pluginOptions: PlantumlOptions) => string
}
