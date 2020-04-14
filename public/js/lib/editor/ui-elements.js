/*
 *  Global UI elements references
 */

export const getUIElements = () => ({
  spinner: $('.ui-spinner'),
  content: $('.ui-content'),
  toolbar: {
    shortStatus: $('.ui-short-status'),
    status: $('.ui-status'),
    new: $('.ui-new'),
    publish: $('.ui-publish'),
    extra: {
      revision: $('.ui-extra-revision'),
      slide: $('.ui-extra-slide')
    },
    download: {
      markdown: $('.ui-download-markdown'),
      html: $('.ui-download-html'),
      rawhtml: $('.ui-download-raw-html')
    },
    export: {
      dropbox: $('.ui-save-dropbox'),
      gist: $('.ui-save-gist'),
      snippet: $('.ui-save-snippet')
    },
    import: {
      dropbox: $('.ui-import-dropbox'),
      gist: $('.ui-import-gist'),
      snippet: $('.ui-import-snippet'),
      clipboard: $('.ui-import-clipboard')
    },
    mode: $('.ui-mode'),
    edit: $('.ui-edit'),
    view: $('.ui-view'),
    both: $('.ui-both'),
    night: $('.ui-night')
  },
  infobar: {
    lastchange: $('.ui-lastchange'),
    lastchangeuser: $('.ui-lastchangeuser'),
    nolastchangeuser: $('.ui-no-lastchangeuser'),
    permission: {
      permission: $('.ui-permission'),
      label: $('.ui-permission-label'),
      viewableBy: {
        anyone: $('.ui-viewable-by-anyone'),
        signedIn: $('.ui-viewable-by-signed-in'),
        owner: $('.ui-viewable-by-owner')
      },
      editableBy: {
        anyone: $('.ui-editable-by-anyone'),
        signedIn: $('.ui-editable-by-signed-in'),
        owner: $('.ui-editable-by-owner')
      },
    },
    delete: $('.ui-delete-note')
  },
  toc: {
    toc: $('.ui-toc'),
    affix: $('.ui-affix-toc'),
    label: $('.ui-toc-label'),
    dropdown: $('.ui-toc-dropdown')
  },
  area: {
    edit: $('.ui-edit-area'),
    view: $('.ui-view-area'),
    codemirror: $('.ui-edit-area .CodeMirror'),
    codemirrorScroll: $('.ui-edit-area .CodeMirror .CodeMirror-scroll'),
    codemirrorSizer: $('.ui-edit-area .CodeMirror .CodeMirror-sizer'),
    codemirrorSizerInner: $(
      '.ui-edit-area .CodeMirror .CodeMirror-sizer > div'
    ),
    markdown: $('.ui-view-area .markdown-body'),
    resize: {
      handle: $('.ui-resizable-handle'),
      syncToggle: $('.ui-sync-toggle')
    }
  },
  modal: {
    snippetImportProjects: $('#snippetImportModalProjects'),
    snippetImportSnippets: $('#snippetImportModalSnippets'),
    revision: $('#revisionModal')
  }
})

export default getUIElements
