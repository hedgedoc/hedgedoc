declare module 'markdown-it-plantuml' {
  import MarkdownIt from 'markdown-it/lib'
  import { PlantumlOptions } from './interface'
  const markdownItPlantuml: MarkdownIt.PluginWithOptions<PlantumlOptions>
  export = markdownItPlantuml
}
