'use strict'
// response
// external modules
var fs = require('fs')
var path = require('path')
var request = require('request')
// core
var config = require('./config')
var logger = require('./logger')
var models = require('./models')
const noteUtil = require('./web/note/util')
const noteController = require('./web/note/controller')
const errors = require('./errors')

// public
var response = {
  showPublishNote: showPublishNote,
  showIndex: showIndex,
  publishNoteActions: publishNoteActions,
  githubActions: githubActions,
  gitlabActions: gitlabActions
}

function showIndex (req, res, next) {
  var authStatus = req.isAuthenticated()
  var deleteToken = ''

  var data = {
    signin: authStatus,
    infoMessage: req.flash('info'),
    errorMessage: req.flash('error'),
    imprint: fs.existsSync(path.join(config.docsPath, 'imprint.md')),
    privacyStatement: fs.existsSync(path.join(config.docsPath, 'privacy.md')),
    termsOfUse: fs.existsSync(path.join(config.docsPath, 'terms-of-use.md')),
    deleteToken: deleteToken
  }

  if (authStatus) {
    models.User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
      if (user) {
        data.deleteToken = user.deleteToken
        res.render('index.ejs', data)
      }
    })
  } else {
    res.render('index.ejs', data)
  }
}

function showPublishNote (req, res, next) {
  var include = [{
    model: models.User,
    as: 'owner'
  }, {
    model: models.User,
    as: 'lastchangeuser'
  }]
  noteUtil.findNote(req, res, function (note) {
    // force to use short id
    var shortid = req.params.shortid
    if ((note.alias && shortid !== note.alias) || (!note.alias && shortid !== note.shortid)) {
      return res.redirect(config.serverURL + '/s/' + (note.alias || note.shortid))
    }
    note.increment('viewcount').then(function (note) {
      if (!note) {
        return errors.errorNotFound(res)
      }
      var body = note.content
      var extracted = models.Note.extractMeta(body)
      var markdown = extracted.markdown
      var meta = models.Note.parseMeta(extracted.meta)
      var createtime = note.createdAt
      var updatetime = note.lastchangeAt
      var title = models.Note.decodeTitle(note.title)
      title = models.Note.generateWebTitle(meta.title || title)
      var ogdata = models.Note.parseOpengraph(meta, title)
      var data = {
        title: title,
        description: meta.description || (markdown ? models.Note.generateDescription(markdown) : null),
        viewcount: note.viewcount,
        createtime: createtime,
        updatetime: updatetime,
        body: body,
        owner: note.owner ? note.owner.id : null,
        ownerprofile: note.owner ? models.User.getProfile(note.owner) : null,
        lastchangeuser: note.lastchangeuser ? note.lastchangeuser.id : null,
        lastchangeuserprofile: note.lastchangeuser ? models.User.getProfile(note.lastchangeuser) : null,
        robots: meta.robots || false, // default allow robots
        GA: meta.GA,
        disqus: meta.disqus,
        cspNonce: res.locals.nonce,
        dnt: req.headers.dnt,
        opengraph: ogdata
      }
      return renderPublish(data, res)
    }).catch(function (err) {
      logger.error(err)
      return errors.errorInternalError(res)
    })
  }, include)
}

function renderPublish (data, res) {
  res.set({
    'Cache-Control': 'private' // only cache by client
  })
  res.render('pretty.ejs', data)
}

function publishNoteActions (req, res, next) {
  noteUtil.findNote(req, res, function (note) {
    var action = req.params.action
    switch (action) {
      case 'download':
        noteController.downloadMarkdown(req, res, note)
        break
      case 'edit':
        res.redirect(config.serverURL + '/' + (note.alias ? note.alias : models.Note.encodeNoteId(note.id)) + '?both')
        break
      default:
        res.redirect(config.serverURL + '/s/' + note.shortid)
        break
    }
  })
}



function githubActions (req, res, next) {
  var noteId = req.params.noteId
  noteUtil.findNote(req, res, function (note) {
    var action = req.params.action
    switch (action) {
      case 'gist':
        githubActionGist(req, res, note)
        break
      default:
        res.redirect(config.serverURL + '/' + noteId)
        break
    }
  })
}

function githubActionGist (req, res, note) {
  var code = req.query.code
  var state = req.query.state
  if (!code || !state) {
    return errors.errorForbidden(res)
  } else {
    var data = {
      client_id: config.github.clientID,
      client_secret: config.github.clientSecret,
      code: code,
      state: state
    }
    var authUrl = 'https://github.com/login/oauth/access_token'
    request({
      url: authUrl,
      method: 'POST',
      json: data
    }, function (error, httpResponse, body) {
      if (!error && httpResponse.statusCode === 200) {
        var accessToken = body.access_token
        if (accessToken) {
          var content = note.content
          var title = models.Note.decodeTitle(note.title)
          var filename = title.replace('/', ' ') + '.md'
          var gist = {
            'files': {}
          }
          gist.files[filename] = {
            'content': content
          }
          var gistUrl = 'https://api.github.com/gists'
          request({
            url: gistUrl,
            headers: {
              'User-Agent': 'CodiMD',
              'Authorization': 'token ' + accessToken
            },
            method: 'POST',
            json: gist
          }, function (error, httpResponse, body) {
            if (!error && httpResponse.statusCode === 201) {
              res.setHeader('referer', '')
              res.redirect(body.html_url)
            } else {
              return errors.errorForbidden(res)
            }
          })
        } else {
          return errors.errorForbidden(res)
        }
      } else {
        return errors.errorForbidden(res)
      }
    })
  }
}

function gitlabActions (req, res, next) {
  var noteId = req.params.noteId
  noteUtil.findNote(req, res, function (note) {
    var action = req.params.action
    switch (action) {
      case 'projects':
        gitlabActionProjects(req, res, note)
        break
      default:
        res.redirect(config.serverURL + '/' + noteId)
        break
    }
  })
}

function gitlabActionProjects (req, res, note) {
  if (req.isAuthenticated()) {
    models.User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
      if (!user) { return errors.errorNotFound(res) }
      var ret = { baseURL: config.gitlab.baseURL, version: config.gitlab.version }
      ret.accesstoken = user.accessToken
      ret.profileid = user.profileid
      request(
        config.gitlab.baseURL + '/api/' + config.gitlab.version + '/projects?membership=yes&per_page=100&access_token=' + user.accessToken,
        function (error, httpResponse, body) {
          if (!error && httpResponse.statusCode === 200) {
            ret.projects = JSON.parse(body)
            return res.send(ret)
          } else {
            return res.send(ret)
          }
        }
      )
    }).catch(function (err) {
      logger.error('gitlab action projects failed: ' + err)
      return errors.errorInternalError(res)
    })
  } else {
    return errors.errorForbidden(res)
  }
}

module.exports = response
