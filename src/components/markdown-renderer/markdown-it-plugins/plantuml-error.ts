import MarkdownIt, { Options } from 'markdown-it/lib'
import Renderer, { RenderRule } from 'markdown-it/lib/renderer'
import Token from 'markdown-it/lib/token'

export const plantumlError: MarkdownIt.PluginSimple = (md) => {
  const defaultRenderer: RenderRule = md.renderer.rules.fence || (() => '')
  md.renderer.rules.fence = (tokens: Token[], idx: number, options: Options, env, slf: Renderer) => {
    const token = tokens[idx]
    if (token.info === 'plantuml') {
      return `
        <p class="alert alert-danger">
          PlantUML plugin is enabled but not properly configured.
        </p>
      `
    }
    return defaultRenderer(tokens, idx, options, env, slf)
  }
}
