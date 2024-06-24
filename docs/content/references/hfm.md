# HedgeDoc Flavored Markdown

HedgeDoc has its own markdown dialect which supports many features from [CommonMark][commonmark]
and [GitHub Flavored Markdown][gfm]. It also adds some new extensions and is missing some.

These tables tell you what exactly we support in HedgeDoc 1.x (HFM 1) and HedgeDoc 2 (HFM 2).

## Typography

| Feature       | HFM 1 | HFM 2 |     CommonMark     |        GFM         |
| ------------- | :---: | :---: | :----------------: | :----------------: |
| bold          |  ☑️   |  ☑️   |         ☑️         |         ☑️         |
| italic        |  ☑️   |  ☑️   |         ☑️         |         ☑️         |
| underline     |  ☑️   |  ☑️   | (☑️ with `<ins>`)  | (☑️ with `<ins>`)  |
| strikethrough |  ☑️   |  ☑️   | (☑️ with `<del>`)  |         ☑️         |
| subscript     |  ☑️   |  ☑️   | (☑️ with `<sub>`)  | (☑️ with `<sub>`)  |
| superscript   |  ☑️   |  ☑️   | (☑️ with `<sup>`)  | (☑️ with `<sup>`)  |
| marked        |  ☑️   |  ☑️   | (☑️ with `<mark>`) | (☑️ with `<mark>`) |

## Extended typography features

| Feature                                     |          HFM 1           |          HFM 2           | CommonMark | GFM |
| ------------------------------------------- | :----------------------: | :----------------------: | :--------: | :-: |
| heading                                     |            ☑️            |            ☑️            |     ☑️     | ☑️  |
| inline code                                 |            ☑️            |            ☑️            |     ☑️     | ☑️  |
| indented code blocks                        |            ☑️            |            ☑️            |     ☑️     | ☑️  |
| code block with language[^highlight]        |            ☑️            |            ☑️            |     ☑️     | ☑️  |
| code block with extra features[^extra-code] |            ☑️            |            ☑️            |            |     |
| block quote                                 |            ☑️            |            ☑️            |     ☑️     | ☑️  |
| name tag (`[name=...]`)                     |    (☑️)[^in-bq-list]     |            ☑️            |            |     |
| time tag (`[time=...]`)                     |    (☑️)[^in-bq-list]     |            ☑️            |            |     |
| color tag (`[color=...]`)                   |    (☑️)[^in-bq-list]     |            ☑️            |            |     |
| unorderd list                               |            ☑️            |            ☑️            |     ☑️     | ☑️  |
| ordered list                                |            ☑️            |            ☑️            |     ☑️     | ☑️  |
| task list                                   |            ☑️            |            ☑️            |            | ☑️  |
| definition list                             |            ☑️            |            ☑️            |            |     |
| emoji                                       | [Unicode 6.1][unicode-6] | [Unicode 13][unicode-13] |            |     |
| [ForkAwesome][fa]                           | ☑️ with `<i class='fa'>` |         removed          |            |     |
| [Bootstrap Icons][bootstrap-icons]          |                          |    ☑️ with shortcodes    |            |     |
| LaTeX                                       |         ☑️[^mj]          |         ☑️[^kt]          |            |     |

[^highlight]: Code blocks with a given language are rendered using syntax highlighting.
[^extra-code]: Several special "language" keywords can be used for rendering diagrams, charts, etc.
[^in-bq-list]: Use of these tags is only supported within blockquotes and (un)ordered lists.
[^mj]: LaTeX is rendered with [MathJax][mathjax].
[^kt]: LaTeX is rendered with [KaTeX][katex].

## Links & Images

| Feature               | HFM 1 | HFM 2 |    CommonMark     |        GFM        |
| --------------------- | :---: | :---: | :---------------: | :---------------: |
| link                  |  ☑️   |  ☑️   |        ☑️         |        ☑️         |
| link reference        |  ☑️   |  ☑️   |        ☑️         |        ☑️         |
| link title            |  ☑️   |  ☑️   |        ☑️         |        ☑️         |
| autolink with `<>`    |  ☑️   |  ☑️   |        ☑️         |        ☑️         |
| autolink without `<>` |  ☑️   |  ☑️   |                   |        ☑️         |
| footnotes             |  ☑️   |  ☑️   |                   |                   |
| image                 |  ☑️   |  ☑️   |        ☑️         |        ☑️         |
| image with given size |  ☑️   |  ☑️   | (☑️ with `<img>`) | (☑️ with `<img>`) |
| table of contents     |  ☑️   |  ☑️   |                   |                   |

## Structural elements

| Feature           |         HFM 1         | HFM 2 |      CommonMark       |          GFM          |
| ----------------- | :-------------------: | :---: | :-------------------: | :-------------------: |
| table             |          ☑️           |  ☑️   |  (☑️ with `<table>`)  |          ☑️           |
| horizontal line   |          ☑️           |  ☑️   |          ☑️           |          ☑️           |
| collapsable block | (☑️ with `<details>`) |  ☑️   | (☑️ with `<details>`) | (☑️ with `<details>`) |
| Alerts            |          ☑️           |  ☑️   |                       |                       |

## Embeddings

HFM 1 includes support for certain embeddings of external content by using the
`{%keyword parameter %}` syntax. To increase the readability of the markdown code
we decided that HFM 2 should just use plain links if possible.

| Feature                                             | HFM 1 |          HFM 2          | CommonMark | GFM |
| --------------------------------------------------- | :---: | :---------------------: | :--------: | :-: |
| PDF (`{%pdf ... %}`)                                |  ☑️   |         removed         |            |     |
| [YouTube][youtube] (`{%youtube ... %}`)             |  ☑️   | with plain link[^embed] |            |     |
| [Vimeo][vimeo] (`{%vimeo ... %}`)                   |  ☑️   | with plain link[^embed] |            |     |
| [Slideshare][slideshare] (`{%slideshare ... %}`)    |  ☑️   |         removed         |            |     |
| [Speakerdeck][speakerdeck] (`{%speakerdeck ... %}`) |  ☑️   |         removed         |            |     |
| [GitHub Gist][gist] (`{%gist ... %}`)               |  ☑️   | with plain link[^embed] |            |     |

[^embed]:
    The special syntax from HFM 1 is deprecated, but will still work in HFM 2. However, a plain link to the
    content should be used.

## HTML

Besides the basic HTML typography elements (`<p>`, `<a>`, `<b>`, `<ins>`, `<del>`)
the following more special HTML elements are supported by some specification.

|    Feature    | HedgeDocMark 1 | HedgeDocMark 2 | CommonMark | GFM |
| :-----------: | :------------: | :------------: | :--------: | :-: |
|   `<title>`   |                |                |     ☑️     |     |
| `<textarea>`  |                |       ☑️       |     ☑️     |     |
|   `<style>`   |       ☑️       |       ☑️       |     ☑️     |     |
|    `<xmp>`    |                |                |     ☑️     |     |
|  `<iframe>`   |       ☑️       |       ☑️       |     ☑️     |     |
|  `<noembed>`  |       ☑️       |                |     ☑️     |     |
| `<noframes>`  |       ☑️       |                |     ☑️     |     |
|  `<script>`   |                |                |     ☑️     |     |
| `<plaintext>` |                |       ☑️       |     ☑️     |     |

[fa]: https://forkaweso.me/
[bootstrap-icons]: https://icons.getbootstrap.com/
[youtube]: https://www.youtube.com/
[vimeo]: https://vimeo.com/
[slideshare]: https://www.slideshare.net/
[speakerdeck]: https://speakerdeck.com/
[gist]: https://gist.github.com/
[mathjax]: https://www.mathjax.org/
[katex]: https://katex.org/
[gfm]: https://github.github.com/gfm/
[commonmark]: https://spec.commonmark.org/
[unicode-6]: https://unicode.org/versions/Unicode6.1.0/
[unicode-13]: https://unicode.org/versions/Unicode13.0.0/
