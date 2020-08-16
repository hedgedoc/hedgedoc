import Renderer from 'markdown-it/lib/renderer'
import Token from 'markdown-it/lib/token'

type RenderContainerReturn = (tokens: Token[], index: number, options: any, env: any, self: Renderer) => void;
type ValidAlertLevels = ('warning' | 'danger' | 'success' | 'info')
export const validAlertLevels: ValidAlertLevels[] = ['success', 'danger', 'info', 'warning']

export const createRenderContainer = (level: ValidAlertLevels): RenderContainerReturn => {
  return (tokens: Token[], index: number, options: any, env: any, self: Renderer) => {
    tokens[index].attrJoin('role', 'alert')
    tokens[index].attrJoin('class', 'alert')
    tokens[index].attrJoin('class', `alert-${level}`)
    return self.renderToken(tokens, index, options)
  }
}
