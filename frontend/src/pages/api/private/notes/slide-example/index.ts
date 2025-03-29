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
      '---\ntype: slide\nslideOptions:\n  transition: slide\n---\n\n# Slide example\n\nThis feature still in beta, may have some issues.\n\nFor details please visit:\n<https://github.com/hakimel/reveal.js/>\n\nYou can use `URL query` or `slideOptions` of the YAML metadata to customize your slides.\n\n---\n\n## First slide\n\n`---`\n\nIs the divider of slides\n\n----\n\n### First branch of first the slide\n\n`----`\n\nIs the divider of branches\n\nUse the *Space* key to navigate through all slides.\n\n----\n\n### Second branch of first the slide\n\nNested slides are useful for adding additional detail underneath a high-level horizontal slide.\n\n---\n\n## Point of View\n\nPress **ESC** to enter the slide overview.\n\n---\n\n## Touch Optimized\n\nPresentations look great on touch devices, like mobile phones and tablets. Simply swipe through your slides.\n\n---\n\n## Fragments\n\n`<!-- .element: class="fragment" data-fragment-index="1" -->`\n\nIs the fragment syntax\n\nHit the next arrow...\n\n... to step through ...\n\n<span>... a<!-- .element: class="fragment" data-fragment-index="1" --></span> <span>fragmented<!-- .element: class="fragment" data-fragment-index="2" --></span> <span>slide.<!-- .element: class="fragment" data-fragment-index="3" --></span>\n\nNote:\n  This slide has fragments which are also stepped through in the notes window.\n\n---\n\n## Fragment Styles\n\nThere are different types of fragments, like:\n\ngrow\n\nshrink\n\nfade-out\n\nfade-up (also down, left and right!)\n\ncurrent-visible\n\nHighlight <span><!-- .element: class="fragment highlight-red" -->red</span> <span><!-- .element: class="fragment highlight-blue" -->blue</span> <span><!-- .element: class="fragment highlight-green"-->green</span>\n\n---\n\n<!-- .slide: data-transition="zoom" -->\n\n## Transition Styles\nDifferent background transitions are available via the transition option. This one\'s called "zoom".\n\n`<!-- .slide: data-transition="zoom" -->`\n\nIs the transition syntax\n\nYou can use:\n\nnone/fade/slide/convex/concave/zoom\n\n---\n\n<!-- .slide: data-transition="fade-in convex-out" -->\n\n`<!-- .slide: data-transition="fade-in convex-out" -->`\n\nAlso, you can set different in/out transition\n\nYou can use:\n\nnone/fade/slide/convex/concave/zoom\n\npostfix with `-in` or `-out`\n\n---\n\n<!-- .slide: data-transition-speed="fast" -->\n\n`<!-- .slide: data-transition-speed="fast" -->`\n\nCustom the transition speed!\n\nYou can use:\n\ndefault/fast/slow\n\n---\n\n## Themes\n\nreveal.js comes with a few themes built in:\n\nBlack (default) - White - League - Sky - Beige - Simple\n\nSerif - Blood - Night - Moon - Solarized\n\nIt can be set in YAML slideOptions\n\n---\n\n<!-- .slide: data-background="#1A237E" -->\n\n`<!-- .slide: data-background="#1A237E" -->`\n\nIs the background syntax\n\n---\n\n<!-- .slide: data-background="https://s3.amazonaws.com/hakim-static/reveal-js/image-placeholder.png" data-background-color="#005" -->\n\n<div style="color: #fff;">\n\n## Image Backgrounds\n\n`<!-- .slide: data-background="image.png"-->`\n\n</div>\n\n----\n\n<!-- .slide: data-background="https://s3.amazonaws.com/hakim-static/reveal-js/image-placeholder.png" data-background-repeat="repeat" data-background-size="100px" data-background-color="#005" -->\n\n<div style="color: #fff;">\n\n## Tiled Backgrounds\n\n`<!-- .slide: data-background="image.png" data-background-repeat="repeat" data-background-size="100px" -->`\n\n</div>\n\n----\n\n<!-- .slide: data-background-video="https://s3.amazonaws.com/static.slid.es/site/homepage/v1/homepage-video-editor.mp4,https://s3.amazonaws.com/static.slid.es/site/homepage/v1/homepage-video-editor.webm" data-background-color="#000000" -->\n\n<div style="background-color: rgba(0, 0, 0, 0.9); color: #fff; padding: 20px;">\n\n## Video Backgrounds\n\n`<!-- .slide: data-background-video="video.mp4,video.webm" -->`\n\n</div>\n\n----\n\n<!-- .slide: data-background="http://i.giphy.com/90F8aUepslB84.gif" -->\n\n## ... and GIFs!\n\n---\n\n## Pretty Code\n\n``` javascript\nfunction linkify( selector ) {\n  if( supports3DTransforms ) {\n\n    const nodes = document.querySelectorAll( selector );\n\n    for( const i = 0, len = nodes.length; i < len; i++ ) {\n      var node = nodes[i];\n\n      if( !node.className ) {\n        node.className += \' roll\';\n      }\n    }\n  }\n}\n```\nCode syntax highlighting courtesy of [highlight.js](http://softwaremaniacs.org/soft/highlight/en/description/).\n\n---\n\n## Marvelous List\n\n- No order here\n- Or here\n- Or here\n- Or here\n\n---\n\n## Fantastic Ordered List\n\n1. One is smaller than...\n2. Two is smaller than...\n3. Three!\n\n---\n\n## Tabular Tables\n\n| Item     | Value | Quantity |\n| ----     | ----- | -------- |\n| Apples   | $1    | 7        |\n| Lemonade | $2    | 18       |\n| Bread    | $3    | 2        |\n\n---\n\n## Clever Quotes\n\n> “For years there has been a theory that millions of monkeys typing at random on millions of typewriters would reproduce the entire works of Shakespeare. The Internet has proven this theory to be untrue.”\n\n---\n\n## Intergalactic Interconnections\n\nYou can link between slides internally, [like this](#/1/3).\n\n---\n\n## Speaker\n\nThere\'s a [speaker view](https://github.com/hakimel/reveal.js#speaker-notes). It includes a timer, preview of the upcoming slide as well as your speaker notes.\n\nPress the *S* key to try it out.\n\nNote:\n  Oh hey, these are some notes. They\'ll be hidden in your presentation, but you can see them if you open the speaker notes window (hit `s` on your keyboard).\n\n---\n\n## Take a Moment\n\nPress `B` or `.` on your keyboard to pause the presentation. This is helpful when you\'re on stage and want to take distracting slides off the screen.\n\n---\n\n## Print your Slides\n\nDown below you can find a print icon<i class="fa fa-fw fa-print"></i>.\n\nAfter you click on it, use the print function of your browser (either CTRL+P or cmd+P) to print the slides as PDF. [See official reveal.js instructions for details](https://github.com/hakimel/reveal.js#instructions-1)\n\n---\n\n# The End\n\n',
    metadata: {
      id: 'slideId',
      primaryAddress: 'slide-example',
      version: 2,
      viewCount: 8,
      updatedAt: '2021-04-30T18:38:23.000Z',
      updateUsername: null,
      createdAt: '2021-04-30T18:38:14.000Z',
      editedBy: [],
      title: 'Slide example',
      tags: [],
      description: '',
      aliases: [
        {
          noteId: 'slideId',
          primaryAlias: true,
          name: 'slide-example'
        }
      ],
      permissions: {
        owner: 'erik',
        sharedToUsers: [
          {
            username: 'tilman',
            canEdit: true
          },
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
          },
          {
            groupName: 'hedgedoc-devs',
            canEdit: true
          }
        ]
      }
    },
    editedByAtPosition: []
  })
}

export default handler
