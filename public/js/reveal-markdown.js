import { preventXSS, escapeAttrValue } from './render'
import { md } from './extra'

/**
 * The reveal.js markdown plugin. Handles parsing of
 * markdown inside of presentations as well as loading
 * of external markdown documents.
 */
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    // Browser globals (root is window)
    root.RevealMarkdown = factory()
    root.RevealMarkdown.initialize()
  }
}(this, function () {
  const DEFAULT_SLIDE_SEPARATOR = '^\r?\n---\r?\n$'
  const DEFAULT_NOTES_SEPARATOR = '^note:'
  const DEFAULT_ELEMENT_ATTRIBUTES_SEPARATOR = '\\.element\\s*?(.+?)$'
  const DEFAULT_SLIDE_ATTRIBUTES_SEPARATOR = '\\.slide:\\s*?(\\S.+?)$'

  const SCRIPT_END_PLACEHOLDER = '__SCRIPT_END__'

  /**
   * Retrieves the markdown contents of a slide section
   * element. Normalizes leading tabs/whitespace.
   */
  function getMarkdownFromSlide (section) {
    const template = section.querySelector('script')

    // strip leading whitespace so it isn't evaluated as code
    let text = (template || section).textContent

    // restore script end tags
    text = text.replace(new RegExp(SCRIPT_END_PLACEHOLDER, 'g'), '</script>')

    const leadingWs = text.match(/^\n?(\s*)/)[1].length
    const leadingTabs = text.match(/^\n?(\t*)/)[1].length

    if (leadingTabs > 0) {
      text = text.replace(new RegExp('\\n?\\t{' + leadingTabs + '}', 'g'), '\n')
    } else if (leadingWs > 1) {
      text = text.replace(new RegExp('\\n? {' + leadingWs + '}', 'g'), '\n')
    }

    return text
  }

  /**
   * Given a markdown slide section element, this will
   * return all arguments that aren't related to markdown
   * parsing. Used to forward any other user-defined arguments
   * to the output markdown slide.
   */
  function getForwardedAttributes (section) {
    const attributes = section.attributes
    const result = []

    for (let i = 0, len = attributes.length; i < len; i++) {
      const name = attributes[i].name
      const value = attributes[i].value

      // disregard attributes that are used for markdown loading/parsing
      if (/data-(markdown|separator|vertical|notes)/gi.test(name)) continue

      if (value) {
        result.push(name + '="' + value + '"')
      } else {
        result.push(name)
      }
    }

    return result.join(' ')
  }

  /**
   * Inspects the given options and fills out default
   * values for what's not defined.
   */
  function getSlidifyOptions (options) {
    options = options || {}
    options.separator = options.separator || DEFAULT_SLIDE_SEPARATOR
    options.notesSeparator = options.notesSeparator || DEFAULT_NOTES_SEPARATOR
    options.attributes = options.attributes || ''

    return options
  }

  /**
   * Helper function for constructing a markdown slide.
   */
  function createMarkdownSlide (content, options) {
    options = getSlidifyOptions(options)

    const notesMatch = content.split(new RegExp(options.notesSeparator, 'mgi'))

    if (notesMatch.length === 2) {
      content = notesMatch[0] + '<aside class="notes" data-markdown>' + notesMatch[1].trim() + '</aside>'
    }

    // prevent script end tags in the content from interfering
    // with parsing
    content = content.replace(/<\/script>/gi, SCRIPT_END_PLACEHOLDER)

    return '<script type="text/template">' + content + '</script>'
  }

  /**
   * Parses a data string into multiple slides based
   * on the passed in separator arguments.
   */
  function slidify (markdown, options) {
    options = getSlidifyOptions(options)

    const separatorRegex = new RegExp(options.separator + (options.verticalSeparator ? '|' + options.verticalSeparator : ''), 'mg')
    const horizontalSeparatorRegex = new RegExp(options.separator)

    let matches
    let lastIndex = 0
    let isHorizontal
    let wasHorizontal = true
    let content
    const sectionStack = []

    // iterate until all blocks between separators are stacked up
    while ((matches = separatorRegex.exec(markdown)) !== null) {
      // determine direction (horizontal by default)
      isHorizontal = horizontalSeparatorRegex.test(matches[0])

      if (!isHorizontal && wasHorizontal) {
        // create vertical stack
        sectionStack.push([])
      }

      // pluck slide content from markdown input
      content = markdown.substring(lastIndex, matches.index)

      if (isHorizontal && wasHorizontal) {
        // add to horizontal stack
        sectionStack.push(content)
      } else {
        // add to vertical stack
        sectionStack[sectionStack.length - 1].push(content)
      }

      lastIndex = separatorRegex.lastIndex
      wasHorizontal = isHorizontal
    }

    // add the remaining slide
    (wasHorizontal ? sectionStack : sectionStack[sectionStack.length - 1]).push(markdown.substring(lastIndex))

    let markdownSections = ''

    // flatten the hierarchical stack, and insert <section data-markdown> tags
    for (let i = 0, len = sectionStack.length; i < len; i++) {
      // vertical
      if (sectionStack[i] instanceof Array) {
        markdownSections += '<section ' + options.attributes + '>'

        sectionStack[i].forEach(function (child) {
          markdownSections += '<section data-markdown>' + createMarkdownSlide(child, options) + '</section>'
        })

        markdownSections += '</section>'
      } else {
        markdownSections += '<section ' + options.attributes + ' data-markdown>' + createMarkdownSlide(sectionStack[i], options) + '</section>'
      }
    }

    return markdownSections
  }

  /**
   * Parses any current data-markdown slides, splits
   * multi-slide markdown into separate sections and
   * handles loading of external markdown.
   */
  function processSlides () {
    const sections = document.querySelectorAll('[data-markdown]')
    let section

    for (let i = 0, len = sections.length; i < len; i++) {
      section = sections[i]

      if (section.getAttribute('data-markdown').length) {
        const xhr = new XMLHttpRequest()
        const url = section.getAttribute('data-markdown')

        const datacharset = section.getAttribute('data-charset')

        // see https://developer.mozilla.org/en-US/docs/Web/API/element.getAttribute#Notes
        if (datacharset !== null && datacharset !== '') {
          xhr.overrideMimeType('text/html; charset=' + datacharset)
        }

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            // file protocol yields status code 0 (useful for local debug, mobile applications etc.)
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
              section.outerHTML = slidify(xhr.responseText, {
                separator: section.getAttribute('data-separator'),
                verticalSeparator: section.getAttribute('data-separator-vertical'),
                notesSeparator: section.getAttribute('data-separator-notes'),
                attributes: getForwardedAttributes(section)
              })
            } else {
              section.outerHTML = '<section data-state="alert">' +
              'ERROR: The attempt to fetch ' + url + ' failed with HTTP status ' + xhr.status + '.' +
              'Check your browser\'s JavaScript console for more details.' +
              '<p>Remember that you need to serve the presentation HTML from a HTTP server.</p>' +
              '</section>'
            }
          }
        }

        xhr.open('GET', url, false)

        try {
          xhr.send()
        } catch (e) {
          alert('Failed to get the Markdown file ' + url + '. Make sure that the presentation and the file are served by a HTTP server and the file can be found there. ' + e)
        }
      } else if (section.getAttribute('data-separator') || section.getAttribute('data-separator-vertical') || section.getAttribute('data-separator-notes')) {
        section.outerHTML = slidify(getMarkdownFromSlide(section), {
          separator: section.getAttribute('data-separator'),
          verticalSeparator: section.getAttribute('data-separator-vertical'),
          notesSeparator: section.getAttribute('data-separator-notes'),
          attributes: getForwardedAttributes(section)
        })
      } else {
        section.innerHTML = createMarkdownSlide(getMarkdownFromSlide(section))
      }
    }
  }

  /**
   * Check if a node value has the attributes pattern.
   * If yes, extract it and add that value as one or several attributes
   * the the terget element.
   *
   * You need Cache Killer on Chrome to see the effect on any FOM transformation
   * directly on refresh (F5)
   * http://stackoverflow.com/questions/5690269/disabling-chrome-cache-for-website-development/7000899#answer-11786277
   */
  function addAttributeInElement (node, elementTarget, separator) {
    const mardownClassesInElementsRegex = new RegExp(separator, 'mg')
    const mardownClassRegex = /([^"= ]+?)="([^"=]+?)"/mg
    let nodeValue = node.nodeValue
    let matches
    let matchesClass
    if ((matches = mardownClassesInElementsRegex.exec(nodeValue))) {
      const classes = matches[1]
      nodeValue = nodeValue.substring(0, matches.index) + nodeValue.substring(mardownClassesInElementsRegex.lastIndex)
      node.nodeValue = nodeValue
      while ((matchesClass = mardownClassRegex.exec(classes))) {
        const name = matchesClass[1]
        const value = matchesClass[2]
        if (name.substr(0, 5) === 'data-' || window.whiteListAttr.indexOf(name) !== -1) { elementTarget.setAttribute(name, escapeAttrValue(value)) }
      }
      return true
    }
    return false
  }

  /**
   * Add attributes to the parent element of a text node,
   * or the element of an attribute node.
   */
  function addAttributes (section, element, previousElement, separatorElementAttributes, separatorSectionAttributes) {
    if (element != null && element.childNodes !== undefined && element.childNodes.length > 0) {
      let previousParentElement = element
      for (let i = 0; i < element.childNodes.length; i++) {
        const childElement = element.childNodes[i]
        if (i > 0) {
          let j = i - 1
          while (j >= 0) {
            const aPreviousChildElement = element.childNodes[j]
            if (typeof aPreviousChildElement.setAttribute === 'function' && aPreviousChildElement.tagName !== 'BR') {
              previousParentElement = aPreviousChildElement
              break
            }
            j = j - 1
          }
        }
        let parentSection = section
        if (childElement.nodeName === 'section') {
          parentSection = childElement
          previousParentElement = childElement
        }
        if (typeof childElement.setAttribute === 'function' || childElement.nodeType === Node.COMMENT_NODE) {
          addAttributes(parentSection, childElement, previousParentElement, separatorElementAttributes, separatorSectionAttributes)
        }
      }
    }

    if (element.nodeType === Node.COMMENT_NODE) {
      if (addAttributeInElement(element, previousElement, separatorElementAttributes) === false) {
        addAttributeInElement(element, section, separatorSectionAttributes)
      }
    }
  }

  /**
   * Converts any current data-markdown slides in the
   * DOM to HTML.
   */
  function convertSlides () {
    const sections = document.querySelectorAll('[data-markdown]')

    for (let i = 0, len = sections.length; i < len; i++) {
      const section = sections[i]

      // Only parse the same slide once
      if (!section.getAttribute('data-markdown-parsed')) {
        section.setAttribute('data-markdown-parsed', true)

        const notes = section.querySelector('aside.notes')
        let markdown = getMarkdownFromSlide(section)
        markdown = markdown.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        let rendered = md.render(markdown)
        rendered = preventXSS(rendered)
        const result = window.postProcess(rendered)
        section.innerHTML = result[0].outerHTML
        addAttributes(section, section, null, section.getAttribute('data-element-attributes') ||
        section.parentNode.getAttribute('data-element-attributes') ||
        DEFAULT_ELEMENT_ATTRIBUTES_SEPARATOR,
        section.getAttribute('data-attributes') ||
        section.parentNode.getAttribute('data-attributes') ||
        DEFAULT_SLIDE_ATTRIBUTES_SEPARATOR)

        // If there were notes, we need to re-add them after
        // having overwritten the section's HTML
        if (notes) {
          section.appendChild(notes)
        }
      }
    }
  }

  // API
  return {
    initialize: function () {
      processSlides()
      convertSlides()
    },
    // TODO: Do these belong in the API?
    processSlides,
    convertSlides,
    slidify
  }
}))
