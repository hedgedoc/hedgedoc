export const editorTestContent = `---
title: Features
description: Many features, such wow!
robots: noindex
tags: hedgedoc, demo, react
opengraph:
  title: Features
---
# Embedding demo
[TOC]

## Mermaid

\`\`\`mermaid
gantt
  title A Gantt Diagram

  section Section
  A task: a1, 2014-01-01, 30d
  Another task: after a1, 20d

  section Another
  Task in sec: 2014-01-12, 12d
  Another task: 24d
\`\`\`

## Flowchart

\`\`\`flow
st=>start: Start
e=>end: End
op=>operation: My Operation
op2=>operation: lalala
cond=>condition: Yes or No?

st->op->op2->cond
cond(yes)->e
cond(no)->op2
\`\`\`

## ABC

\`\`\`abc
X:1
T:Speed the Plough
M:4/4
C:Trad.
K:G
|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|
GABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|
|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|
g2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|
\`\`\`

## CSV

\`\`\`csv delimiter=; header
Username; Identifier;First name;Last name
"booker12; rbooker";9012;Rachel;Booker
grey07;2070;Laura;Grey
johnson81;4081;Craig;Johnson
jenkins46;9346;Mary;Jenkins
smith79;5079;Jamie;Smith
\`\`\`

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

## ToDo List

- [ ] ToDos
  - [X] Buy some salad
  - [ ] Brush teeth
  - [x] Drink some water
  - [ ] **Click my box** and see the source code, if you're allowed to edit!

`
