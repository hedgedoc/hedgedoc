/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RevisionDto } from '@hedgedoc/commons'
import { HttpMethod, respondToMatchingRequest } from '../../../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<RevisionDto>(HttpMethod.GET, req, res, {
    id: 0,
    createdAt: '2021-12-21T16:59:42.000Z',
    title: 'Features',
    description: 'Many features, such wow!',
    tags: ['hedgedoc', 'demo', 'react'],
    patch: `Index:
===================================================================
---
+++
@@ -0,0 +1,92 @@
+---
+title: Features
+description: Many features, such wow!
+robots: noindex
+tags: hedgedoc, demo, react
+opengraph:
+  title: Features
+---
+# Embedding demo
+[TOC]
+
+## some plain text
+
+Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
+
+## MathJax
+You can render *LaTeX* mathematical expressions using **MathJax**, as on [math.stackexchange.com](https://math.stackexchange.com/):
+
+The *Gamma function* satisfying $\\Gamma(n) = (n-1)!\\quad\\forall n\\in\\mathbb N$ is via the Euler integral
+
+$$
+x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.
+$$
+
+$$
+\\Gamma(z) = \\int_0^\\infty t^{z-1}e^{-t}dt\\,.
+$$
+
+> More information about **LaTeX** mathematical expressions [here](https://meta.math.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference).
+
+## Blockquote
+> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
+> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
+> [color=red] [name=John Doe] [time=2020-06-21 22:50]
+
+## Slideshare
+{%slideshare mazlan1/internet-of-things-the-tip-of-an-iceberg %}
+
+## Gist
+https://gist.github.com/schacon/1
+
+## YouTube
+https://www.youtube.com/watch?v=KgMpKsp23yY
+
+## Vimeo
+https://vimeo.com/23237102
+
+## Asciinema
+https://asciinema.org/a/117928
+
+## PDF
+{%pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf %}
+
+## Code highlighting
+\`\`\`javascript=
+
+let a = 1
+\`\`\`
+
+## PlantUML
+\`\`\`plantuml
+@startuml
+participant Alice
+participant "The **Famous** Bob" as Bob
+
+Alice -> Bob : hello --there--
+... Some ~~long delay~~ ...
+Bob -> Alice : ok
+note left
+  This is **bold**
+  This is //italics//
+  This is ""monospaced""
+  This is --stroked--
+  This is __underlined__
+  This is ~~waved~~
+end note
+
+Alice -> Bob : A //well formatted// message
+note right of Alice
+ This is <back:cadetblue><size:18>displayed</size></back>
+ __left of__ Alice.
+end note
+note left of Bob
+ <u:red>This</u> is <color #118888>displayed</color>
+ **<color purple>left of</color> <s:red>Alice</strike> Bob**.
+end note
+note over Alice, Bob
+ <w:#FF33FF>This is hosted</w> by <img sourceforge.jpg>
+end note
+@enduml
+\`\`\`
+
`,
    edits: [],
    length: 2782,
    authorUsernames: [],
    anonymousAuthorCount: 2,
    content: `---
title: Features
description: Many features, such wow!
robots: noindex
tags: hedgedoc, demo, react
opengraph:
  title: Features
---
# Embedding demo
[TOC]

## some plain text

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.

## MathJax
You can render *LaTeX* mathematical expressions using **MathJax**, as on [math.stackexchange.com](https://math.stackexchange.com/):

The *Gamma function* satisfying $\\Gamma(n) = (n-1)!\\quad\\forall n\\in\\mathbb N$ is via the Euler integral

$$
x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.
$$

$$
\\Gamma(z) = \\int_0^\\infty t^{z-1}e^{-t}dt\\,.
$$

> More information about **LaTeX** mathematical expressions [here](https://meta.math.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference).

## Blockquote
> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
> [color=red] [name=John Doe] [time=2020-06-21 22:50]

## Slideshare
{%slideshare mazlan1/internet-of-things-the-tip-of-an-iceberg %}

## Gist
https://gist.github.com/schacon/1

## YouTube
https://www.youtube.com/watch?v=KgMpKsp23yY

## Vimeo
https://vimeo.com/23237102

## Asciinema
https://asciinema.org/a/117928

## PDF
{%pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf %}

## Code highlighting
\`\`\`javascript=

let a = 1
\`\`\`

## PlantUML
\`\`\`plantuml
@startuml
participant Alice
participant "The **Famous** Bob" as Bob

Alice -> Bob : hello --there--
... Some ~~long delay~~ ...
Bob -> Alice : ok
note left
  This is **bold**
  This is //italics//
  This is ""monospaced""
  This is --stroked--
  This is __underlined__
  This is ~~waved~~
end note

Alice -> Bob : A //well formatted// message
note right of Alice
 This is <back:cadetblue><size:18>displayed</size></back>
 __left of__ Alice.
end note
note left of Bob
 <u:red>This</u> is <color #118888>displayed</color>
 **<color purple>left of</color> <s:red>Alice</strike> Bob**.
end note
note over Alice, Bob
 <w:#FF33FF>This is hosted</w> by <img sourceforge.jpg>
end note
@enduml
\`\`\`

`
  })
}

export default handler
