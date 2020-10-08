import MarkdownIt from 'markdown-it'

export abstract class MarkdownItConfigurator {
  protected configurations:MarkdownIt.PluginSimple[] = [];
  protected postConfigurations:MarkdownIt.PluginSimple[] = [];

  protected abstract configure(markdownIt: MarkdownIt): void;

  public pushConfig (plugin: MarkdownIt.PluginSimple): this {
    this.configurations.push(plugin)
    return this
  }

  public buildConfiguredMarkdownIt (): MarkdownIt {
    const markdownIt = new MarkdownIt('default', {
      html: true,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    this.configure(markdownIt)
    this.configurations.forEach((configuration) => markdownIt.use(configuration))
    this.postConfigurations.forEach((postConfiguration) => markdownIt.use(postConfiguration))
    return markdownIt
  }
}
