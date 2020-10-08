import markdownItTaskLists from '@hedgedoc/markdown-it-task-lists'
import MarkdownIt from 'markdown-it'

export const tasksLists: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItTaskLists(markdownIt, {
    enabled: true,
    label: true,
    labelAfter: true,
    lineNumber: true
  })
}
