/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it'

export abstract class MarkdownItConfigurator {
  protected configurations: MarkdownIt.PluginSimple[] = []
  protected postConfigurations: MarkdownIt.PluginSimple[] = []

  public pushConfig(plugin: MarkdownIt.PluginSimple): this {
    this.configurations.push(plugin)
    return this
  }

  public buildConfiguredMarkdownIt(): MarkdownIt {
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

  protected abstract configure(markdownIt: MarkdownIt): void;
}
