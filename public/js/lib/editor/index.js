/* global CodeMirror, inlineAttachment, editor  */
import '@hedgedoc/codemirror-5/addon/comment/comment.js'
import '@hedgedoc/codemirror-5/addon/comment/continuecomment.js'
import '@hedgedoc/codemirror-5/addon/dialog/dialog.js'
import '@hedgedoc/codemirror-5/addon/display/autorefresh.js'
import '@hedgedoc/codemirror-5/addon/display/fullscreen.js'
import '@hedgedoc/codemirror-5/addon/display/panel.js'
import '@hedgedoc/codemirror-5/addon/display/placeholder.js'
import '@hedgedoc/codemirror-5/addon/edit/closebrackets.js'
import '@hedgedoc/codemirror-5/addon/edit/closetag.js'
import '@hedgedoc/codemirror-5/addon/edit/continuelist.js'
import '@hedgedoc/codemirror-5/addon/edit/matchbrackets.js'
import '@hedgedoc/codemirror-5/addon/edit/matchtags.js'
import '@hedgedoc/codemirror-5/addon/fold/brace-fold.js'
import '@hedgedoc/codemirror-5/addon/fold/foldcode.js'
import '@hedgedoc/codemirror-5/addon/fold/foldgutter.js'
import '@hedgedoc/codemirror-5/addon/fold/markdown-fold.js'
import '@hedgedoc/codemirror-5/addon/fold/xml-fold.js'
import '@hedgedoc/codemirror-5/addon/merge/merge.js'
import '@hedgedoc/codemirror-5/addon/mode/multiplex.js'
import '@hedgedoc/codemirror-5/addon/mode/overlay.js'
import '@hedgedoc/codemirror-5/addon/mode/simple.js'
import '@hedgedoc/codemirror-5/addon/scroll/annotatescrollbar.js'
import '@hedgedoc/codemirror-5/addon/scroll/simplescrollbars.js'
import '@hedgedoc/codemirror-5/addon/search/jump-to-line.js'
import '@hedgedoc/codemirror-5/addon/search/match-highlighter.js'
import '@hedgedoc/codemirror-5/addon/search/matchesonscrollbar.js'
import '@hedgedoc/codemirror-5/addon/search/search.js'
import '@hedgedoc/codemirror-5/addon/search/searchcursor.js'
import '@hedgedoc/codemirror-5/addon/selection/active-line.js'
import '@hedgedoc/codemirror-5/addon/wrap/hardwrap.js'
import '@hedgedoc/codemirror-5/keymap/emacs.js'
import '@hedgedoc/codemirror-5/keymap/sublime.js'
import '@hedgedoc/codemirror-5/keymap/vim.js'
import '@hedgedoc/codemirror-5/mode/clike/clike.js'
import '@hedgedoc/codemirror-5/mode/clojure/clojure.js'
import '@hedgedoc/codemirror-5/mode/cmake/cmake.js'
import '@hedgedoc/codemirror-5/mode/coffeescript/coffeescript.js'
import '@hedgedoc/codemirror-5/mode/css/css.js'
import '@hedgedoc/codemirror-5/mode/csv/csv.js'
import '@hedgedoc/codemirror-5/mode/diff/diff.js'
import '@hedgedoc/codemirror-5/mode/dockerfile/dockerfile.js'
import '@hedgedoc/codemirror-5/mode/gfm/gfm.js'
import '@hedgedoc/codemirror-5/mode/gherkin/gherkin.js'
import '@hedgedoc/codemirror-5/mode/go/go.js'
import '@hedgedoc/codemirror-5/mode/graphviz/graphviz.js'
import '@hedgedoc/codemirror-5/mode/groovy/groovy.js'
import '@hedgedoc/codemirror-5/mode/haskell/haskell.js'
import '@hedgedoc/codemirror-5/mode/htmlembedded/htmlembedded.js'
import '@hedgedoc/codemirror-5/mode/htmlmixed/htmlmixed.js'
import '@hedgedoc/codemirror-5/mode/javascript/javascript.js'
import '@hedgedoc/codemirror-5/mode/jsx/jsx.js'
import '@hedgedoc/codemirror-5/mode/lua/lua.js'
import '@hedgedoc/codemirror-5/mode/markdown/markdown_math.js'
import '@hedgedoc/codemirror-5/mode/mediawiki/mediawiki.js'
import '@hedgedoc/codemirror-5/mode/mermaid/mermaid.js'
import '@hedgedoc/codemirror-5/mode/mllike/mllike.js'
import '@hedgedoc/codemirror-5/mode/nginx/nginx.js'
import '@hedgedoc/codemirror-5/mode/perl/perl.js'
import '@hedgedoc/codemirror-5/mode/php/php.js'
import '@hedgedoc/codemirror-5/mode/plantuml/plantuml.js'
import '@hedgedoc/codemirror-5/mode/protobuf/protobuf.js'
import '@hedgedoc/codemirror-5/mode/pug/pug.js'
import '@hedgedoc/codemirror-5/mode/python/python.js'
import '@hedgedoc/codemirror-5/mode/r/r.js'
import '@hedgedoc/codemirror-5/mode/ruby/ruby.js'
import '@hedgedoc/codemirror-5/mode/rust/rust.js'
import '@hedgedoc/codemirror-5/mode/sas/sas.js'
import '@hedgedoc/codemirror-5/mode/sass/sass.js'
import '@hedgedoc/codemirror-5/mode/shell/shell.js'
import '@hedgedoc/codemirror-5/mode/solidity/solidity.js'
import '@hedgedoc/codemirror-5/mode/sql/sql.js'
import '@hedgedoc/codemirror-5/mode/stex/stex.js'
import '@hedgedoc/codemirror-5/mode/swift/swift.js'
import '@hedgedoc/codemirror-5/mode/tiddlywiki/tiddlywiki.js'
import '@hedgedoc/codemirror-5/mode/typescript/typescript.js'
import '@hedgedoc/codemirror-5/mode/vb/vb.js'
import '@hedgedoc/codemirror-5/mode/verilog/verilog.js'
import '@hedgedoc/codemirror-5/mode/vhdl/vhdl.js'
import '@hedgedoc/codemirror-5/mode/xml/xml.js'
import '@hedgedoc/codemirror-5/mode/yaml-frontmatter/yaml-frontmatter.js'
import '@hedgedoc/codemirror-5/mode/yaml/yaml.js'
import '../../../vendor/codemirror-spell-checker/spell-checker.min.js'

import '../../../vendor/inlineAttachment/inline-attachment'
import '../../../vendor/inlineAttachment/codemirror.inline-attachment'

import * as utils from './utils'
import config from './config'
import statusBarTemplate from './statusbar.html?raw'
import toolBarTemplate from './toolbar.html?raw'

import '../../../css/ui/toolbar.css'
import Cookies from 'js-cookie'

/* config section */
const isMac = CodeMirror.keyMap.default === CodeMirror.keyMap.macDefault
const defaultEditorMode = 'gfm'
const viewportMargin = 20

const jumpToAddressBarKeymapName = isMac ? 'Cmd-L' : 'Ctrl-L'

export default class Editor {
  constructor () {
    this.editor = null
    this.jumpToAddressBarKeymapValue = null
    this.defaultExtraKeys = {
      F10: function (cm) {
        cm.setOption('fullScreen', !cm.getOption('fullScreen'))
      },
      Esc: function (cm) {
        if (cm.getOption('fullScreen') && !(cm.getOption('keyMap').substr(0, 3) === 'vim')) {
          cm.setOption('fullScreen', false)
        } else {
          return CodeMirror.Pass
        }
      },
      'Cmd-S': function () {
        return false
      },
      'Ctrl-S': function () {
        return false
      },
      Enter: 'newlineAndIndentContinueMarkdownList',
      Tab: function (cm) {
        const tab = '\t'

        // contruct x length spaces
        const spaces = Array(parseInt(cm.getOption('indentUnit')) + 1).join(' ')

        // auto indent whole line when in list or blockquote
        const cursor = cm.getCursor()
        const line = cm.getLine(cursor.line)

        // this regex match the following patterns
        // 1. blockquote starts with "> " or ">>"
        // 2. unorder list starts with *+-
        // 3. order list starts with "1." or "1)"
        const regex = /^(\s*)(>[> ]*|[*+-]\s|(\d+)([.)]))/

        let match
        const multiple = cm.getSelection().split('\n').length > 1 ||
          cm.getSelections().length > 1

        if (multiple) {
          cm.execCommand('defaultTab')
        } else if ((match = regex.exec(line)) !== null) {
          const ch = match[1].length
          const pos = {
            line: cursor.line,
            ch
          }
          if (cm.getOption('indentWithTabs')) {
            cm.replaceRange(tab, pos, pos, '+input')
          } else {
            cm.replaceRange(spaces, pos, pos, '+input')
          }
        } else {
          if (cm.getOption('indentWithTabs')) {
            cm.execCommand('defaultTab')
          } else {
            cm.replaceSelection(spaces)
          }
        }
      },
      'Cmd-Left': 'goLineLeftSmart',
      'Cmd-Right': 'goLineRight',
      Home: 'goLineLeftSmart',
      End: 'goLineRight',
      'Ctrl-C': function (cm) {
        if (!isMac && cm.getOption('keyMap').substr(0, 3) === 'vim') {
          document.execCommand('copy')
        } else {
          return CodeMirror.Pass
        }
      },
      'Ctrl-*': cm => {
        utils.wrapTextWith(this.editor, cm, '*')
      },
      'Shift-Ctrl-8': cm => {
        utils.wrapTextWith(this.editor, cm, '*')
      },
      'Ctrl-_': cm => {
        utils.wrapTextWith(this.editor, cm, '_')
      },
      'Shift-Ctrl--': cm => {
        utils.wrapTextWith(this.editor, cm, '_')
      },
      'Ctrl-~': cm => {
        utils.wrapTextWith(this.editor, cm, '~')
      },
      'Shift-Ctrl-`': cm => {
        utils.wrapTextWith(this.editor, cm, '~')
      },
      'Ctrl-^': cm => {
        utils.wrapTextWith(this.editor, cm, '^')
      },
      'Shift-Ctrl-6': cm => {
        utils.wrapTextWith(this.editor, cm, '^')
      },
      'Ctrl-+': cm => {
        utils.wrapTextWith(this.editor, cm, '+')
      },
      'Shift-Ctrl-=': cm => {
        utils.wrapTextWith(this.editor, cm, '+')
      },
      'Ctrl-=': cm => {
        utils.wrapTextWith(this.editor, cm, '=')
      },
      'Shift-Ctrl-Backspace': cm => {
        utils.wrapTextWith(this.editor, cm, 'Backspace')
      }
    }
    this.eventListeners = {}
    this.config = config
  }

  on (event, cb) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [cb]
    } else {
      this.eventListeners[event].push(cb)
    }

    this.editor.on(event, (...args) => {
      this.eventListeners[event].forEach(cb => cb.bind(this)(...args))
    })
  }

  addToolBar () {
    const inlineAttach = inlineAttachment.editors.codemirror4.attach(this.editor)
    this.toolBar = $(toolBarTemplate)
    this.toolbarPanel = this.editor.addPanel(this.toolBar[0], {
      position: 'top'
    })

    const makeBold = $('#makeBold')
    const makeItalic = $('#makeItalic')
    const makeStrike = $('#makeStrike')
    const makeHeader = $('#makeHeader')
    const makeCode = $('#makeCode')
    const makeQuote = $('#makeQuote')
    const makeGenericList = $('#makeGenericList')
    const makeOrderedList = $('#makeOrderedList')
    const makeCheckList = $('#makeCheckList')
    const makeLink = $('#makeLink')
    const makeImage = $('#makeImage')
    const makeTable = $('#makeTable')
    const makeLine = $('#makeLine')
    const makeComment = $('#makeComment')
    const uploadImage = $('#uploadImage')

    makeBold.click(() => {
      utils.wrapTextWith(this.editor, this.editor, '**')
      this.editor.focus()
    })

    makeItalic.click(() => {
      utils.wrapTextWith(this.editor, this.editor, '*')
      this.editor.focus()
    })

    makeStrike.click(() => {
      utils.wrapTextWith(this.editor, this.editor, '~~')
      this.editor.focus()
    })

    makeHeader.click(() => {
      utils.insertHeader(this.editor)
    })

    makeCode.click(() => {
      utils.wrapTextWith(this.editor, this.editor, '```')
      this.editor.focus()
    })

    makeQuote.click(() => {
      utils.insertOnStartOfLines(this.editor, '> ')
    })

    makeGenericList.click(() => {
      utils.insertOnStartOfLines(this.editor, '* ')
    })

    makeOrderedList.click(() => {
      utils.insertOnStartOfLines(this.editor, '1. ')
    })

    makeCheckList.click(() => {
      utils.insertOnStartOfLines(this.editor, '- [ ] ')
    })

    makeLink.click(() => {
      utils.insertLink(this.editor, false)
    })

    makeImage.click(() => {
      utils.insertLink(this.editor, true)
    })

    makeTable.click(() => {
      utils.insertText(this.editor, '\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n')
    })

    makeLine.click(() => {
      utils.insertText(this.editor, '\n----\n')
    })

    makeComment.click(() => {
      utils.insertText(this.editor, '> []')
    })

    uploadImage.bind('change', function (e) {
      const files = e.target.files || e.dataTransfer.files
      e.dataTransfer = {}
      e.dataTransfer.files = files
      inlineAttach.onDrop(e)
    })
  }

  addStatusBar () {
    this.statusBar = $(statusBarTemplate)
    this.statusCursor = this.statusBar.find('.status-cursor > .status-line-column')
    this.statusSelection = this.statusBar.find('.status-cursor > .status-selection')
    this.statusFile = this.statusBar.find('.status-file')
    this.statusIndicators = this.statusBar.find('.status-indicators')
    this.statusIndent = this.statusBar.find('.status-indent')
    this.statusKeymap = this.statusBar.find('.status-keymap')
    this.statusLength = this.statusBar.find('.status-length')
    this.statusTheme = this.statusBar.find('.status-theme')
    this.statusSpellcheck = this.statusBar.find('.status-spellcheck')
    this.statusPreferences = this.statusBar.find('.status-preferences')
    this.statusPanel = this.editor.addPanel(this.statusBar[0], {
      position: 'bottom'
    })

    this.setIndent()
    this.setKeymap()
    this.setTheme()
    this.setSpellcheck()
    this.setPreferences()
  }

  updateStatusBar () {
    if (!this.statusBar) return

    const cursor = this.editor.getCursor()
    const cursorText = 'Line ' + (cursor.line + 1) + ', Columns ' + (cursor.ch + 1)
    this.statusCursor.text(cursorText)
    const fileText = ' — ' + editor.lineCount() + ' Lines'
    this.statusFile.text(fileText)
    const docLength = editor.getValue().length
    this.statusLength.text('Length ' + docLength)
    if (docLength > (config.docmaxlength * 0.95)) {
      this.statusLength.css('color', 'red')
      this.statusLength.attr('title', 'You have almost reached the limit for this document.')
    } else if (docLength > (config.docmaxlength * 0.8)) {
      this.statusLength.css('color', 'orange')
      this.statusLength.attr('title', 'This document is nearly full, consider splitting it or creating a new one.')
    } else {
      this.statusLength.css('color', 'white')
      this.statusLength.attr('title', 'You can write up to ' + config.docmaxlength + ' characters in this document.')
    }
  }

  setIndent () {
    const cookieIndentType = Cookies.get('indent_type')
    let cookieTabSize = parseInt(Cookies.get('tab_size'))
    let cookieSpaceUnits = parseInt(Cookies.get('space_units'))
    if (cookieIndentType) {
      if (cookieIndentType === 'tab') {
        this.editor.setOption('indentWithTabs', true)
        if (cookieTabSize) {
          this.editor.setOption('indentUnit', cookieTabSize)
        }
      } else if (cookieIndentType === 'space') {
        this.editor.setOption('indentWithTabs', false)
        if (cookieSpaceUnits) {
          this.editor.setOption('indentUnit', cookieSpaceUnits)
        }
      }
    }
    if (cookieTabSize) {
      this.editor.setOption('tabSize', cookieTabSize)
    }

    const type = this.statusIndicators.find('.indent-type')
    const widthLabel = this.statusIndicators.find('.indent-width-label')
    const widthInput = this.statusIndicators.find('.indent-width-input')

    const setType = () => {
      if (this.editor.getOption('indentWithTabs')) {
        Cookies.set('indent_type', 'tab', {
          expires: 365,
          sameSite: window.cookiePolicy,
          secure: window.location.protocol === 'https:'
        })
        type.text('Tab Size:')
      } else {
        Cookies.set('indent_type', 'space', {
          expires: 365,
          sameSite: window.cookiePolicy,
          secure: window.location.protocol === 'https:'
        })
        type.text('Spaces:')
      }
    }
    setType()

    const setUnit = () => {
      const unit = this.editor.getOption('indentUnit')
      if (this.editor.getOption('indentWithTabs')) {
        Cookies.set('tab_size', unit, {
          expires: 365,
          sameSite: window.cookiePolicy,
          secure: window.location.protocol === 'https:'
        })
      } else {
        Cookies.set('space_units', unit, {
          expires: 365,
          sameSite: window.cookiePolicy,
          secure: window.location.protocol === 'https:'
        })
      }
      widthLabel.text(unit)
    }
    setUnit()

    type.click(() => {
      if (this.editor.getOption('indentWithTabs')) {
        this.editor.setOption('indentWithTabs', false)
        cookieSpaceUnits = parseInt(Cookies.get('space_units'))
        if (cookieSpaceUnits) {
          this.editor.setOption('indentUnit', cookieSpaceUnits)
        }
      } else {
        this.editor.setOption('indentWithTabs', true)
        cookieTabSize = parseInt(Cookies.get('tab_size'))
        if (cookieTabSize) {
          this.editor.setOption('indentUnit', cookieTabSize)
          this.editor.setOption('tabSize', cookieTabSize)
        }
      }
      setType()
      setUnit()
    })
    widthLabel.click(() => {
      if (widthLabel.is(':visible')) {
        widthLabel.addClass('hidden')
        widthInput.removeClass('hidden')
        widthInput.val(this.editor.getOption('indentUnit'))
        widthInput.select()
      } else {
        widthLabel.removeClass('hidden')
        widthInput.addClass('hidden')
      }
    })
    widthInput.on('change', () => {
      let val = parseInt(widthInput.val())
      if (!val) val = this.editor.getOption('indentUnit')
      if (val < 1) val = 1
      else if (val > 10) val = 10

      if (this.editor.getOption('indentWithTabs')) {
        this.editor.setOption('tabSize', val)
      }
      this.editor.setOption('indentUnit', val)
      setUnit()
    })
    widthInput.on('blur', function () {
      widthLabel.removeClass('hidden')
      widthInput.addClass('hidden')
    })
  }

  setKeymap () {
    const cookieKeymap = Cookies.get('keymap')
    if (cookieKeymap) {
      this.editor.setOption('keyMap', cookieKeymap)
    }

    const label = this.statusIndicators.find('.ui-keymap-label')
    const sublime = this.statusIndicators.find('.ui-keymap-sublime')
    const emacs = this.statusIndicators.find('.ui-keymap-emacs')
    const vim = this.statusIndicators.find('.ui-keymap-vim')

    const setKeymapLabel = () => {
      const keymap = this.editor.getOption('keyMap')
      Cookies.set('keymap', keymap, {
        expires: 365,
        sameSite: window.cookiePolicy,
        secure: window.location.protocol === 'https:'
      })
      label.text(keymap)
      this.restoreOverrideEditorKeymap()
      this.setOverrideBrowserKeymap()
    }
    setKeymapLabel()

    sublime.click(() => {
      this.editor.setOption('keyMap', 'sublime')
      setKeymapLabel()
    })
    emacs.click(() => {
      this.editor.setOption('keyMap', 'emacs')
      setKeymapLabel()
    })
    vim.click(() => {
      this.editor.setOption('keyMap', 'vim')
      setKeymapLabel()
    })
  }

  setTheme () {
    const cookieTheme = Cookies.get('theme')
    if (cookieTheme) {
      this.editor.setOption('theme', cookieTheme)
    }

    const themeToggle = this.statusTheme.find('.ui-theme-toggle')

    const checkTheme = () => {
      const theme = this.editor.getOption('theme')
      if (theme === 'one-dark') {
        themeToggle.removeClass('active')
      } else {
        themeToggle.addClass('active')
      }
    }

    themeToggle.click(() => {
      let theme = this.editor.getOption('theme')
      if (theme === 'one-dark') {
        theme = 'default'
      } else {
        theme = 'one-dark'
      }
      this.editor.setOption('theme', theme)
      Cookies.set('theme', theme, {
        expires: 365,
        sameSite: window.cookiePolicy,
        secure: window.location.protocol === 'https:'
      })

      checkTheme()
    })

    checkTheme()
  }

  setSpellcheck () {
    const cookieSpellcheck = Cookies.get('spellcheck')
    if (cookieSpellcheck) {
      let mode = null
      if (cookieSpellcheck === 'true' || cookieSpellcheck === true) {
        mode = 'spell-checker'
      } else {
        mode = defaultEditorMode
      }
      if (mode && mode !== this.editor.getOption('mode')) {
        this.editor.setOption('mode', mode)
      }
    }

    const spellcheckToggle = this.statusSpellcheck.find('.ui-spellcheck-toggle')

    const checkSpellcheck = () => {
      const mode = this.editor.getOption('mode')
      if (mode === defaultEditorMode) {
        spellcheckToggle.removeClass('active')
      } else {
        spellcheckToggle.addClass('active')
      }
    }

    spellcheckToggle.click(() => {
      let mode = this.editor.getOption('mode')
      if (mode === defaultEditorMode) {
        mode = 'spell-checker'
      } else {
        mode = defaultEditorMode
      }
      if (mode && mode !== this.editor.getOption('mode')) {
        this.editor.setOption('mode', mode)
      }
      Cookies.set('spellcheck', mode === 'spell-checker', {
        expires: 365,
        sameSite: window.cookiePolicy,
        secure: window.location.protocol === 'https:'
      })

      checkSpellcheck()
    })

    checkSpellcheck()

    // workaround spellcheck might not activate beacuse the ajax loading
    if (window.num_loaded < 2) {
      const spellcheckTimer = setInterval(
        () => {
          if (window.num_loaded >= 2) {
            if (this.editor.getOption('mode') === 'spell-checker') {
              this.editor.setOption('mode', 'spell-checker')
            }
            clearInterval(spellcheckTimer)
          }
        },
        100
      )
    }
  }

  resetEditorKeymapToBrowserKeymap () {
    const keymap = this.editor.getOption('keyMap')
    if (!this.jumpToAddressBarKeymapValue) {
      this.jumpToAddressBarKeymapValue = CodeMirror.keyMap[keymap][jumpToAddressBarKeymapName]
      delete CodeMirror.keyMap[keymap][jumpToAddressBarKeymapName]
    }
  }

  restoreOverrideEditorKeymap () {
    const keymap = this.editor.getOption('keyMap')
    if (this.jumpToAddressBarKeymapValue) {
      CodeMirror.keyMap[keymap][jumpToAddressBarKeymapName] = this.jumpToAddressBarKeymapValue
      this.jumpToAddressBarKeymapValue = null
    }
  }

  setOverrideBrowserKeymap () {
    const overrideBrowserKeymap = $(
      '.ui-preferences-override-browser-keymap label > input[type="checkbox"]'
    )
    if (overrideBrowserKeymap.is(':checked')) {
      Cookies.set('preferences-override-browser-keymap', true, {
        expires: 365,
        sameSite: window.cookiePolicy,
        secure: window.location.protocol === 'https:'
      })
      this.restoreOverrideEditorKeymap()
    } else {
      Cookies.remove('preferences-override-browser-keymap')
      this.resetEditorKeymapToBrowserKeymap()
    }
  }

  setPreferences () {
    const overrideBrowserKeymap = $(
      '.ui-preferences-override-browser-keymap label > input[type="checkbox"]'
    )
    const cookieOverrideBrowserKeymap = Cookies.get(
      'preferences-override-browser-keymap'
    )
    if (cookieOverrideBrowserKeymap && cookieOverrideBrowserKeymap === 'true') {
      overrideBrowserKeymap.prop('checked', true)
    } else {
      overrideBrowserKeymap.prop('checked', false)
    }
    this.setOverrideBrowserKeymap()

    overrideBrowserKeymap.change(() => {
      this.setOverrideBrowserKeymap()
    })
  }

  init (textit) {
    this.editor = CodeMirror.fromTextArea(textit, {
      mode: defaultEditorMode,
      backdrop: defaultEditorMode,
      keyMap: 'sublime',
      viewportMargin,
      styleActiveLine: true,
      lineNumbers: true,
      lineWrapping: true,
      showCursorWhenSelecting: true,
      highlightSelectionMatches: true,
      indentUnit: 4,
      continueComments: 'Enter',
      theme: 'one-dark',
      inputStyle: 'textarea',
      matchBrackets: true,
      autoCloseBrackets: true,
      matchTags: {
        bothTags: true
      },
      autoCloseTags: true,
      foldGutter: true,
      gutters: [
        'CodeMirror-linenumbers',
        'authorship-gutters',
        'CodeMirror-foldgutter'
      ],
      extraKeys: this.defaultExtraKeys,
      flattenSpans: true,
      addModeClass: true,
      readOnly: true,
      autoRefresh: true,
      otherCursors: true,
      placeholder: "← Start by entering a title here\n===\nVisit /features if you don't know what to do.\nHappy hacking :)"
    })

    return this.editor
  }

  getEditor () {
    return this.editor
  }
}
