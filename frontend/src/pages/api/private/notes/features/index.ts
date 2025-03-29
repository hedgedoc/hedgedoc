/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpMethod, respondToMatchingRequest } from '../../../../../handler-utils/respond-to-matching-request'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { NoteDto } from '@hedgedoc/commons'

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  respondToMatchingRequest<NoteDto>(HttpMethod.GET, req, res, {
    content:
      '---\ntitle: Features\ndescription: Many features, such wow!\nrobots: noindex\ntags:\n  - hedgedoc\n  - demo\n  - react\nopengraph:\n  title: Features\n---\n# Embedding demo\n[TOC]\n\n## Vega-Lite\n\n```vega-lite\n\n{\n  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",\n  "description": "Reproducing http://robslink.com/SAS/democd91/pyramid_pie.htm",\n  "data": {\n    "values": [\n      {"category": "Sky", "value": 75, "order": 3},\n      {"category": "Shady side of a pyramid", "value": 10, "order": 1},\n      {"category": "Sunny side of a pyramid", "value": 15, "order": 2}\n    ]\n  },\n  "mark": {"type": "arc", "outerRadius": 80},\n  "encoding": {\n    "theta": {\n      "field": "value", "type": "quantitative",\n      "scale": {"range": [2.35619449, 8.639379797]},\n      "stack": true\n    },\n    "color": {\n      "field": "category", "type": "nominal",\n      "scale": {\n        "domain": ["Sky", "Shady side of a pyramid", "Sunny side of a pyramid"],\n        "range": ["#416D9D", "#674028", "#DEAC58"]\n      },\n      "legend": {\n        "orient": "none",\n        "title": null,\n        "columns": 1,\n        "legendX": 200,\n        "legendY": 80\n      }\n    },\n    "order": {\n      "field": "order"\n    }\n  },\n  "view": {"stroke": null}\n}\n\n\n```\n\n## GraphViz\n\n```graphviz\ngraph {\n  a -- b\n  a -- b\n  b -- a [color=blue]\n}\n```\n\n```graphviz\ndigraph structs {\n  node [shape=record];\n  struct1 [label="<f0> left|<f1> mid&#92; dle|<f2> right"];\n  struct2 [label="<f0> one|<f1> two"];\n  struct3 [label="hello&#92;nworld |{ b |{c|<here> d|e}| f}| g | h"];\n  struct1:f1 -> struct2:f0;\n  struct1:f2 -> struct3:here;\n}\n```\n\n```graphviz\ndigraph G {\n  main -> parse -> execute;\n  main -> init;\n  main -> cleanup;\n  execute -> make_string;\n  execute -> printf\n  init -> make_string;\n  main -> printf;\n  execute -> compare;\n}\n```\n\n```graphviz\ndigraph D {\n    node [fontname="Arial"];\n    node_A [shape=record    label="shape=record|{above|middle|below}|right"];\n    node_B [shape=plaintext label="shape=plaintext|{curly|braces and|bars without}|effect"];\n}\n```\n\n```graphviz\ndigraph D {\n  A -> {B, C, D} -> {F}\n}\n```\n\n## High Res Image\n\n![Wheat Field with Cypresses](/public/img/highres.jpg)\n\n## Sequence Diagram (deprecated)\n\n```sequence\nTitle: Here is a title\nnote over A: asdd\nA->B: Normal line\nB-->C: Dashed line\nC->>D: Open arrow\nD-->>A: Dashed open arrow\nparticipant IOOO\n```\n\n## Mermaid\n\n```mermaid\ngantt\n  title A Gantt Diagram\n\n  section Section\n  A task: a1, 2014-01-01, 30d\n  Another task: after a1, 20d\n\n  section Another\n  Task in sec: 2014-01-12, 12d\n  Another task: 24d\n```\n\n## Flowchart\n\n```flow\nst=>start: Start\ne=>end: End\nop=>operation: My Operation\nop2=>operation: lalala\ncond=>condition: Yes or No?\n\nst->op->op2->cond\ncond(yes)->e\ncond(no)->op2\n```\n\n## ABC\n\n```abc\nX:1\nT:Speed the Plough\nM:4/4\nC:Trad.\nK:G\n|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|\nGABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|\n|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|\ng2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|\n```\n\n## CSV\n\n```csv delimiter=; header\nUsername; Identifier;First name;Last name\n"booker12; rbooker";9012;Rachel;Booker\ngrey07;2070;Laura;Grey\njohnson81;4081;Craig;Johnson\njenkins46;9346;Mary;Jenkins\nsmith79;5079;Jamie;Smith\n```\n\n## some plain text\n\nLorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.\n\n## KaTeX\nYou can render *LaTeX* mathematical expressions using **KaTeX**, as on [math.stackexchange.com](https://math.stackexchange.com/):\n\nThe *Gamma function* satisfying $\\Gamma(n) = (n-1)!\\quad\\forall n\\in\\mathbb N$ is via the Euler integral\n\n$$\nx = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.\n$$\n\n$$\n\\Gamma(z) = \\int_0^\\infty t^{z-1}e^{-t}dt\\,.\n$$\n\n> More information about **LaTeX** mathematical expressions [here](https://meta.math.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference).\n\n## Blockquote\n> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.\n> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.\n> [color=red] [name=John Doe] [time=2020-06-21 22:50]\n\n## Slideshare\n{%slideshare mazlan1/internet-of-things-the-tip-of-an-iceberg %}\n\n## Gist\nhttps://gist.github.com/schacon/1\n\n## YouTube\nhttps://www.youtube.com/watch?v=YE7VzlLtp-4\n\n## Vimeo\nhttps://vimeo.com/23237102\n\n## Asciinema\nhttps://asciinema.org/a/117928\n\n## PDF\n{%pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf %}\n\n## Code highlighting\n```js=\nvar s = "JavaScript syntax highlighting";\nalert(s);\nfunction $initHighlight(block, cls) {\n  try {\n    if (cls.search(/\\bno\\-highlight\\b/) != -1)\n      return process(block, true, 0x0F) +\n             \' class=""\';\n  } catch (e) {\n    /* handle exception */\n  }\n  for (var i = 0 / 2; i < classes.length; i++) {\n    if (checkCondition(classes[i]) === undefined)\n      return /\\d+[\\s/]/g;\n  }\n}\n```\n\n## PlantUML\n```plantuml\n@startuml\nparticipant Alice\nparticipant "The **Famous** Bob" as Bob\n\nAlice -> Bob : hello --there--\n... Some ~~long delay~~ ...\nBob -> Alice : ok\nnote left\n  This is **bold**\n  This is //italics//\n  This is ""monospaced""\n  This is --stroked--\n  This is __underlined__\n  This is ~~waved~~\nend note\n\nAlice -> Bob : A //well formatted// message\nnote right of Alice\n This is <back:cadetblue><size:18>displayed</size></back>\n __left of__ Alice.\nend note\nnote left of Bob\n <u:red>This</u> is <color #118888>displayed</color>\n **<color purple>left of</color> <s:red>Alice</strike> Bob**.\nend note\nnote over Alice, Bob\n <w:#FF33FF>This is hosted</w> by <img sourceforge.jpg>\nend note\n@enduml\n```\n\n## ToDo List\n\n- [ ] ToDos\n  - [X] Buy some salad\n  - [ ] Brush teeth\n  - [x] Drink some water\n  - [ ] **Click my box** and see the source code, if you\'re allowed to edit!\n\n',
    metadata: {
      id: 'exampleId',
      version: 2,
      viewCount: 0,
      updatedAt: '2021-04-24T09:27:51.000Z',
      createdAt: '2021-04-24T09:27:51.000Z',
      updateUsername: null,
      primaryAddress: 'features',
      editedBy: [],
      title: 'Features',
      tags: ['hedgedoc', 'demo', 'react'],
      description: 'Many features, such wow!',
      aliases: [
        {
          name: 'features',
          primaryAlias: true,
          noteId: 'exampleId'
        }
      ],
      permissions: {
        owner: 'tilman',
        sharedToUsers: [
          {
            username: 'molly',
            canEdit: true
          }
        ],
        sharedToGroups: [
          {
            groupName: '_LOGGED_IN',
            canEdit: true
          },
          {
            groupName: '_EVERYONE',
            canEdit: false
          }
        ]
      }
    },
    editedByAtPosition: []
  } as NoteDto)
}

export default handler
