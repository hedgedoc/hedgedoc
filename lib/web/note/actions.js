'use strict'

const models = require('../../models')
const logger = require('../../logger')
const config = require('../../config')
const errors = require('../../errors')
const fs = require('fs')
const shortId = require('shortid')
const markdownpdf = require('markdown-pdf')
const moment = require('moment')
const querystring = require('querystring')
const noteUtil = require('./util')

exports.doAction = function (req, res, next) {
  const noteId = req.params.noteId
  noteUtil.findNote(req, res, function (note) {
    const action = req.params.action
    switch (action) {
      case 'publish':
      case 'pretty': // pretty deprecated
        actionPublish(req, res, note)
        break
      case 'slide':
        actionSlide(req, res, note)
        break
      case 'download':
        exports.actionDownload(req, res, note)
        break
      case 'info':
        actionInfo(req, res, note)
        break
      case 'pdf':
        if (config.allowPDFExport) {
          actionPDF(req, res, note)
        } else {
          logger.error('PDF export failed: Disabled by config. Set "allowPDFExport: true" to enable. Check the documentation for details')
          errors.errorForbidden(res)
        }
        break
      case 'gist':
        actionGist(req, res, note)
        break
      case 'revision':
        actionRevision(req, res, note)
        break
      default:
        return res.redirect(config.serverURL + '/' + noteId)
    }
  })
}

function actionPublish (req, res, note) {
  res.redirect(config.serverURL + '/s/' + (note.alias || note.shortid))
}

function actionSlide (req, res, note) {
  res.redirect(config.serverURL + '/p/' + (note.alias || note.shortid))
}

exports.actionDownload = function (req, res, note) {
  const body = note.content
  let filename = models.Note.decodeTitle(note.title)
  filename = encodeURIComponent(filename)
  res.set({
    'Access-Control-Allow-Origin': '*', // allow CORS as API
    'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
    'Content-Type': 'text/markdown; charset=UTF-8',
    'Cache-Control': 'private',
    'Content-disposition': 'attachment; filename=' + filename + '.md',
    'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
  })
  res.send(body)
}

function actionInfo (req, res, note) {
  const body = note.content
  const extracted = models.Note.extractMeta(body)
  const markdown = extracted.markdown
  const meta = models.Note.parseMeta(extracted.meta)
  const createtime = note.createdAt
  const updatetime = note.lastchangeAt
  const title = models.Note.decodeTitle(note.title)
  const data = {
    title: meta.title || title,
    description: meta.description || (markdown ? models.Note.generateDescription(markdown) : null),
    viewcount: note.viewcount,
    createtime: createtime,
    updatetime: updatetime
  }
  res.set({
    'Access-Control-Allow-Origin': '*', // allow CORS as API
    'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
    'Cache-Control': 'private', // only cache by client
    'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
  })
  res.send(data)
}

function actionPDF (req, res, note) {
  const url = config.serverURL || 'http://' + req.get('host')
  const body = note.content
  const extracted = models.Note.extractMeta(body)
  let content = extracted.markdown
  const title = models.Note.decodeTitle(note.title)

  if (!fs.existsSync(config.tmpPath)) {
    fs.mkdirSync(config.tmpPath)
  }
  const path = config.tmpPath + '/' + Date.now() + '.pdf'
  content = content.replace(/\]\(\//g, '](' + url + '/')
  markdownpdf().from.string(content).to(path, function () {
    if (!fs.existsSync(path)) {
      logger.error('PDF seems to not be generated as expected. File doesn\'t exist: ' + path)
      return errors.errorInternalError(res)
    }
    const stream = fs.createReadStream(path)
    let filename = title
    // Be careful of special characters
    filename = encodeURIComponent(filename)
    // Ideally this should strip them
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '.pdf"')
    res.setHeader('Cache-Control', 'private')
    res.setHeader('Content-Type', 'application/pdf; charset=UTF-8')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow') // prevent crawling
    stream.pipe(res)
    fs.unlinkSync(path)
  })
}

function actionGist (req, res, note) {
  const data = {
    client_id: config.github.clientID,
    redirect_uri: config.serverURL + '/auth/github/callback/' + models.Note.encodeNoteId(note.id) + '/gist',
    scope: 'gist',
    state: shortId.generate()
  }
  const query = querystring.stringify(data)
  res.redirect('https://github.com/login/oauth/authorize?' + query)
}

function actionRevision (req, res, note) {
  const actionId = req.params.actionId
  if (actionId) {
    const time = moment(parseInt(actionId))
    if (time.isValid()) {
      models.Revision.getPatchedNoteRevisionByTime(note, time, function (err, content) {
        if (err) {
          logger.error(err)
          return errors.errorInternalError(res)
        }
        if (!content) {
          return errors.errorNotFound(res)
        }
        res.set({
          'Access-Control-Allow-Origin': '*', // allow CORS as API
          'Access-Control-Allow-Headers': 'Range',
          'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
          'Cache-Control': 'private', // only cache by client
          'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
        })
        res.send(content)
      })
    } else {
      return errors.errorNotFound(res)
    }
  } else {
    models.Revision.getNoteRevisions(note, function (err, data) {
      if (err) {
        logger.error(err)
        return errors.errorInternalError(res)
      }
      const out = {
        revision: data
      }
      res.set({
        'Access-Control-Allow-Origin': '*', // allow CORS as API
        'Access-Control-Allow-Headers': 'Range',
        'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
        'Cache-Control': 'private', // only cache by client
        'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
      })
      res.send(out)
    })
  }
}
