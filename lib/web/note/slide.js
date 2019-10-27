const noteUtil = require('./util')
const models = require('../../models')
const errors = require('../../errors')
const logger = require('../../logger')
const config = require('../../config')
const fs = require('fs')
const path = require('path')

exports.publishSlideActions = function (req, res, next) {
  noteUtil.findNote(req, res, function (note) {
    const action = req.params.action
    if (action === 'edit') {
      res.redirect(config.serverURL + '/' + (note.alias ? note.alias : models.Note.encodeNoteId(note.id)) + '?both')
    } else { res.redirect(config.serverURL + '/p/' + note.shortid) }
  })
}

exports.showPublishSlide = function (req, res, next) {
  const include = [{
    model: models.User,
    as: 'owner'
  }, {
    model: models.User,
    as: 'lastchangeuser'
  }]
  noteUtil.findNote(req, res, function (note) {
    // force to use short id
    const shortid = req.params.shortid
    if ((note.alias && shortid !== note.alias) || (!note.alias && shortid !== note.shortid)) {
      return res.redirect(config.serverURL + '/p/' + (note.alias || note.shortid))
    }
    note.increment('viewcount').then(function (note) {
      if (!note) {
        return errors.errorNotFound(res)
      }
      const body = note.content
      const extracted = models.Note.extractMeta(body)
      const markdown = extracted.markdown
      const meta = models.Note.parseMeta(extracted.meta)
      const createtime = note.createdAt
      const updatetime = note.lastchangeAt
      let title = models.Note.decodeTitle(note.title)
      title = models.Note.generateWebTitle(meta.title || title)
      const data = {
        title: title,
        description: meta.description || (markdown ? models.Note.generateDescription(markdown) : null),
        viewcount: note.viewcount,
        createtime: createtime,
        updatetime: updatetime,
        body: markdown,
        theme: meta.slideOptions && isRevealTheme(meta.slideOptions.theme),
        meta: JSON.stringify(extracted.meta),
        owner: note.owner ? note.owner.id : null,
        ownerprofile: note.owner ? models.User.getProfile(note.owner) : null,
        lastchangeuser: note.lastchangeuser ? note.lastchangeuser.id : null,
        lastchangeuserprofile: note.lastchangeuser ? models.User.getProfile(note.lastchangeuser) : null,
        robots: meta.robots || false, // default allow robots
        GA: meta.GA,
        disqus: meta.disqus,
        cspNonce: res.locals.nonce,
        dnt: req.headers.dnt
      }
      return renderPublishSlide(data, res)
    }).catch(function (err) {
      logger.error(err)
      return errors.errorInternalError(res)
    })
  }, include)
}

function renderPublishSlide (data, res) {
  res.set({
    'Cache-Control': 'private' // only cache by client
  })
  res.render('slide.ejs', data)
}

function isRevealTheme (theme) {
  if (fs.existsSync(path.join(__dirname, '..', 'public', 'build', 'reveal.js', 'css', 'theme', theme + '.css'))) {
    return theme
  }
  return undefined
}
