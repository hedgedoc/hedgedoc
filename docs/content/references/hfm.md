# HedgeDoc Flavored Markdown

HedgeDoc mostly follows the [CommonMark][commonmark] standard. It shares some extensions with the [GFM][gfm] standard, but for historical reasons HedgeDoc does support not exactly GFM, but a bit more in places (and a bit less in other places).

These tables will tell you what exactly we support in HedgeDoc 1.x (HFM 1) and will support in HedgeDoc 2 (HFM 2).

**Please keep in mind that HedgeDoc 2 is still in development and not functional yet.**


## Typography


| Feature       | HFM 1 | HFM 2 | CommonMark          | GFM               |
|---------------|:-----:|:-----:|:-------------------:|:-----------------:|
| bold          | :ballot_box_with_check: | :ballot_box_with_check:     | :ballot_box_with_check:                   | :ballot_box_with_check:                 |
| italic        | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:                   | :ballot_box_with_check:                 |
| underline     | :ballot_box_with_check:     | :ballot_box_with_check:     | (:ballot_box_with_check: with `<ins>`)    | (:ballot_box_with_check: with `<ins>`)  |
| strikethrough | :ballot_box_with_check:     | :ballot_box_with_check:     | (:ballot_box_with_check: with `<del>`)    | :ballot_box_with_check:                 |
| subscript     | :ballot_box_with_check:     | :ballot_box_with_check:     | (:ballot_box_with_check: with `<sub>`)    | (:ballot_box_with_check: with `<sub>`)  |
| superscript   | :ballot_box_with_check:     | :ballot_box_with_check:     | (:ballot_box_with_check: with `<sup>`)    | (:ballot_box_with_check: with `<sup>`)  |
| marked        | :ballot_box_with_check:     | :ballot_box_with_check:     | (:ballot_box_with_check: with `<mark>`)   | (:ballot_box_with_check: with `<mark>`) |

## Extended typography features

| Feature                        | HFM 1 | HFM 2 | CommonMark | GFM |
|--------------------------------|:-----:|:-----:|:----------:|:---:|
| heading                        | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:          | :ballot_box_with_check:   |
| inline code                    | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:          | :ballot_box_with_check:   |
| indented code blocks           | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:          | :ballot_box_with_check:   |
| code block with language[^highlight]       | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:          | :ballot_box_with_check:   |
| code block with extra features[^extra-code] | :ballot_box_with_check:     | :ballot_box_with_check:     |            |     |
| block quote                    | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:          | :ballot_box_with_check:   |
| name tag (`[name=...]`)        | (:ballot_box_with_check:)[^in-bq-list]     | :ballot_box_with_check:     |            |     |
| time tag (`[time=...]`)        | (:ballot_box_with_check:)[^in-bq-list]     | :ballot_box_with_check:     |            |     |
| color tag (`[color=...]`)      | (:ballot_box_with_check:)[^in-bq-list]     | :ballot_box_with_check:     |            |     |
| unorderd list                  | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:          | :ballot_box_with_check:   |
| ordered list                   | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:          | :ballot_box_with_check:   |
| task list                      | :ballot_box_with_check:     | :ballot_box_with_check:     |            | :ballot_box_with_check:   |
| defition list                  | :ballot_box_with_check:     | :ballot_box_with_check:     |            |     |
| emoji             | [Unicode 6.1][unicode-6] | [Unicode 13][unicode-13] |                      |                      |
| [ForkAwesome][fa] | :ballot_box_with_check: with `<i class='fa'>`  | :ballot_box_with_check: with shortcodes        |                      |                      |
| LaTeX             | :ballot_box_with_check:[^mj]                   | :ballot_box_with_check:[^kt]                   |                      |                      |

[^highlight]: Code-blocks with a given language are rendered with syntax-highlighting for the code.
[^extra-code]: Several special "language" keywords can be used for rendering diagrams, charts, etc.
[^in-bq-list]: Use of these tags is only supported within blockquotes or (un)ordered lists.
[^mj]: LaTeX is rendered with [MathJax][mathjax].
[^kt]: LaTeX is rendered with [KaTeX][katex].

## Links & Images

| Feature               | HFM 1 | HFM 2 | CommonMark       | GFM              |
|-----------------------|:-----:|:-----:|:----------------:|:----------------:|
| link                  | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:                | :ballot_box_with_check:                |
| link reference        | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:                | :ballot_box_with_check:                |
| link title            | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:                | :ballot_box_with_check:                |
| autolink with `<>`    | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:                | :ballot_box_with_check:                |
| autolink without `<>` | :ballot_box_with_check:     | :ballot_box_with_check:     |                  | :ballot_box_with_check:                |
| footnotes             | :ballot_box_with_check:     | :ballot_box_with_check:     |                  |                  |
| image                 | :ballot_box_with_check:     | :ballot_box_with_check:     | :ballot_box_with_check:                | :ballot_box_with_check:                |
| image with given size | :ballot_box_with_check:     | :ballot_box_with_check:     | (:ballot_box_with_check: with `<img>`) | (:ballot_box_with_check: with `<img>`) |
| table of contents     | :ballot_box_with_check:     | :ballot_box_with_check:     |                  |                  |


## Structural elements

| Feature           | HFM 1                    | HFM 2                    | CommonMark           | GFM                  |
|-------------------|:------------------------:|:------------------------:|:--------------------:|:--------------------:|
| table             | :ballot_box_with_check:                        | :ballot_box_with_check:                        | (:ballot_box_with_check: with `<table>`)   | :ballot_box_with_check:                    |
| horizontal line   | :ballot_box_with_check:                        | :ballot_box_with_check:                        | :ballot_box_with_check:                    | :ballot_box_with_check:                    |
| collapsable block | (:ballot_box_with_check: with `<details>`)     | :ballot_box_with_check:                        | (:ballot_box_with_check: with `<details>`) | (:ballot_box_with_check: with `<details>`) |
| Alerts            | :ballot_box_with_check:                        | :ballot_box_with_check:                        |                      |                      |

## Embeddings
HFM1 included support for certain embeddings of external content. These were defined in markdown by the uncommon `{%keyword parameter %}` syntax.

Instead of this uncommon syntax, HFM2 uses just plain links to external content and creates embeddings for supported providers.

| Feature                  | HFM 1 | HFM 2              | CommonMark | GFM |
|--------------------------|:-----:|:------------------:|:----------:|:---:|
| PDF (`{%pdf ... %}`)     | :ballot_box_with_check:     | removed            |            |     |
| [YouTube][youtube] (`{%youtube ... %}`)       | :ballot_box_with_check:     | with plain link[^embed] |            |     |
| [Vimeo][vimeo] (`{%vimeo ... %}`)          | :ballot_box_with_check:     | with plain link[^embed] |            |     |
| [Slideshare][slideshare] (`{%slideshare ... %}`) | :ballot_box_with_check:     | removed            |            |     |
| [Speakerdeck][speakerdeck] (`{%speakerdeck ... %}`) | :ballot_box_with_check:     | removed            |            |     |
| [GitHub Gist][gist] (`{%gist ... %}`)             | :ballot_box_with_check:     | with plain link[^embed] |            |     |

[^embed]: The special syntax is deprecated but will continue to work. However a plain link to the content will generate the same embedding and is preferred.

## HTML
Besides the basic HTML typography elements (`<p>`, `<a>`, `<b>`, `<ins>`, `<del>`) the following more special HTML elements are supported by some specification.

|    Feature    | HedgeDocMark 1 | HedgeDocMark 2 | CommonMark | GFM |
|:-------------:|:--------------:|:--------------:|:----------:|:---:|
|   `<title>`   |                |                | :ballot_box_with_check:          |     |
|  `<textarea>` |                | :ballot_box_with_check:              | :ballot_box_with_check:          |     |
|   `<style>`   | :ballot_box_with_check:              | :ballot_box_with_check:              | :ballot_box_with_check:          |     |
|    `<xmp>`    |                |                | :ballot_box_with_check:          |     |
|   `<iframe>`  | :ballot_box_with_check:              | :ballot_box_with_check:              | :ballot_box_with_check:          |     |
|  `<noembed>`  | :ballot_box_with_check:              |                | :ballot_box_with_check:          |     |
|  `<noframes>` | :ballot_box_with_check:              |                | :ballot_box_with_check:          |     |
|   `<script>`  |                |                | :ballot_box_with_check:          |     |
| `<plaintext>` |                | :ballot_box_with_check:              | :ballot_box_with_check:          |     |

[fa]: https://forkaweso.me/
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
