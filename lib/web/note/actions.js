const models = require('../../models')
const logger = require('../../logger')
const config = require('../../config')
const errors = require('../../errors')
const fs = require('fs')
const shortId = require('shortid')
const markdownpdf = require('markdown-pdf')
const moment = require('moment')
const querystring = require('querystring')

exports.getInfo = function getInfo (req, res, note) {
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

exports.createPDF = function createPDF (req, res, note) {
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

exports.createGist = function createGist (req, res, note) {
  const data = {
    client_id: config.github.clientID,
    redirect_uri: config.serverURL + '/auth/github/callback/' + models.Note.encodeNoteId(note.id) + '/gist',
    scope: 'gist',
    state: shortId.generate()
  }
  const query = querystring.stringify(data)
  res.redirect('https://github.com/login/oauth/authorize?' + query)
}

exports.getRevision = function getRevision (req, res, note) {
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
