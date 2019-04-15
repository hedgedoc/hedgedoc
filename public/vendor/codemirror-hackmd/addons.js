//     CodiMD - Collaborative markdown notes
//     Copyright (C) 2019  Christoph (Sheogorath) Kern
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU Affero General Public License as
//     published by the Free Software Foundation, either version 3 of the
//     License, or (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU Affero General Public License for more details.
//
//     You should have received a copy of the GNU Affero General Public License
//     along with this program.  If not, see <https://www.gnu.org/licenses/>.

import exec1 from 'script-loader!codemirror/addon/mode/overlay.js'
import exec2 from 'script-loader!codemirror/addon/mode/simple.js'
import exec3 from 'script-loader!codemirror/addon/mode/multiplex.js'
import exec4 from 'script-loader!codemirror/addon/selection/active-line.js'
import exec5 from 'script-loader!codemirror/addon/search/searchcursor.js'
import exec6 from 'script-loader!codemirror/addon/search/search.js'
import exec7 from 'script-loader!codemirror/addon/search/jump-to-line.js'
import exec8 from 'script-loader!codemirror/addon/search/matchesonscrollbar.js'
import exec9 from 'script-loader!codemirror/addon/search/match-highlighter.js'
import exec10 from 'script-loader!codemirror/addon/scroll/simplescrollbars.js'
import exec11 from 'script-loader!codemirror/addon/scroll/annotatescrollbar.js'
import exec12 from 'script-loader!codemirror/addon/display/panel.js'
import exec13 from 'script-loader!codemirror/addon/display/placeholder.js'
import exec14 from 'script-loader!codemirror/addon/display/fullscreen.js'
import exec15 from 'script-loader!codemirror/addon/display/autorefresh.js'
import exec16 from 'script-loader!codemirror/addon/dialog/dialog.js'
import exec17 from 'script-loader!codemirror/addon/edit/matchbrackets.js'
import exec18 from 'script-loader!codemirror/addon/edit/closebrackets.js'
import exec19 from 'script-loader!codemirror/addon/edit/matchtags.js'
import exec20 from 'script-loader!codemirror/addon/edit/closetag.js'
import exec21 from 'script-loader!codemirror/addon/edit/continuelist.js'
import exec22 from 'script-loader!codemirror/addon/comment/comment.js'
import exec23 from 'script-loader!codemirror/addon/comment/continuecomment.js'
import exec24 from 'script-loader!codemirror/addon/wrap/hardwrap.js'
import exec25 from 'script-loader!codemirror/addon/fold/foldcode.js'
import exec26 from 'script-loader!codemirror/addon/fold/brace-fold.js'
import exec27 from 'script-loader!codemirror/addon/fold/foldgutter.js'
import exec28 from 'script-loader!codemirror/addon/fold/markdown-fold.js'
import exec29 from 'script-loader!codemirror/addon/fold/xml-fold.js'
import exec30 from 'script-loader!codemirror/mode/xml/xml.js'
import exec31 from 'script-loader!./mode/markdown/markdown_math.js'
import exec32 from 'script-loader!codemirror/mode/gfm/gfm.js'
import exec33 from 'script-loader!codemirror/mode/javascript/javascript.js'
import exec34 from 'script-loader!./mode/typescript/typescript.js'
import exec35 from 'script-loader!codemirror/mode/jsx/jsx.js'
import exec36 from 'script-loader!codemirror/mode/css/css.js'
import exec37 from 'script-loader!codemirror/mode/htmlmixed/htmlmixed.js'
import exec38 from 'script-loader!codemirror/mode/htmlembedded/htmlembedded.js'
import exec39 from 'script-loader!codemirror/mode/clike/clike.js'
import exec40 from 'script-loader!codemirror/mode/clojure/clojure.js'
import exec41 from 'script-loader!codemirror/mode/diff/diff.js'
import exec42 from 'script-loader!codemirror/mode/ruby/ruby.js'
import exec43 from 'script-loader!codemirror/mode/rust/rust.js'
import exec44 from 'script-loader!codemirror/mode/python/python.js'
import exec45 from 'script-loader!codemirror/mode/shell/shell.js'
import exec46 from 'script-loader!codemirror/mode/php/php.js'
import exec47 from 'script-loader!codemirror/mode/sas/sas.js'
import exec48 from 'script-loader!codemirror/mode/stex/stex.js'
import exec49 from 'script-loader!codemirror/mode/sql/sql.js'
import exec50 from 'script-loader!codemirror/mode/haskell/haskell.js'
import exec51 from 'script-loader!codemirror/mode/coffeescript/coffeescript.js'
import exec52 from 'script-loader!codemirror/mode/yaml/yaml.js'
import exec53 from 'script-loader!codemirror/mode/yaml-frontmatter/yaml-frontmatter.js'
import exec54 from 'script-loader!codemirror/mode/pug/pug.js'
import exec55 from 'script-loader!codemirror/mode/lua/lua.js'
import exec56 from 'script-loader!codemirror/mode/cmake/cmake.js'
import exec57 from 'script-loader!codemirror/mode/nginx/nginx.js'
import exec58 from 'script-loader!codemirror/mode/perl/perl.js'
import exec59 from 'script-loader!codemirror/mode/sass/sass.js'
import exec60 from 'script-loader!codemirror/mode/r/r.js'
import exec61 from 'script-loader!codemirror/mode/dockerfile/dockerfile.js'
import exec62 from 'script-loader!codemirror/mode/tiddlywiki/tiddlywiki.js'
import exec63 from 'script-loader!./mode/mediawiki/mediawiki.js'
import exec64 from 'script-loader!codemirror/mode/go/go.js'
import exec65 from 'script-loader!codemirror/mode/groovy/groovy.js'
import exec66 from 'script-loader!codemirror/mode/gherkin/gherkin.js'
import exec67 from 'script-loader!codemirror/keymap/emacs.js'
import exec68 from 'script-loader!codemirror/keymap/sublime.js'
import exec69 from 'script-loader!codemirror/keymap/vim.js';
