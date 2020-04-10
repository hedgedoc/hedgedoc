import {Table, Model, Column, DataType, BelongsTo, IsUUID, PrimaryKey, ForeignKey} from 'sequelize-typescript'
var Sequelize = require('sequelize')
import  async = require('async')
import moment = require('moment')
import childProcess = require('child_process')
import shortId = require('shortid')
import path = require('path')

var Op = Sequelize.Op

// core
import logger = require('../logger')
import {ChildProcess} from "child_process";
import { Note } from './note'

var dmpWorker : ChildProcess | null = createDmpWorker()
var dmpCallbackCache = {}

function createDmpWorker () {
  var worker = childProcess.fork(path.resolve(__dirname, '../workers/dmpWorker.js'), ['ignore'])
  logger.debug('dmp worker process started')
  worker.on('message', function (data: any) {
    if (!data || !data.msg || !data.cacheKey) {
      return logger.error('dmp worker error: not enough data on message')
    }
    var cacheKey = data.cacheKey
    switch (data.msg) {
      case 'error':
        dmpCallbackCache[cacheKey](data.error, null)
        break
      case 'check':
        dmpCallbackCache[cacheKey](null, data.result)
        break
    }
    delete dmpCallbackCache[cacheKey]
  })
  worker.on('close', function (code) {
    dmpWorker = null;
    logger.debug(`dmp worker process exited with code ${code}`)
  })
  return worker
}

function sendDmpWorker (data, callback) {
  if (!dmpWorker) dmpWorker = createDmpWorker()
  var cacheKey = Date.now() + '_' + shortId.generate()
  dmpCallbackCache[cacheKey] = callback
  data = Object.assign(data, {
    cacheKey: cacheKey
  })
  dmpWorker.send(data)
}

@Table
export class Revision extends Model<Revision> {
  @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;  

  @Column(DataType.TEXT({ length: 'long' }))
  get patch(): string {
    return Sequelize.processData(this.getDataValue('patch'), '')
  }
  set patch(value: string) {
    this.setDataValue('patch', Sequelize.stripNullByte(value))
  }

  @Column(DataType.TEXT({ length: 'long' }))
  get lastContent(): string {
    return Sequelize.processData(this.getDataValue('lastContent'), '')
  }
  set lastContent(value: string) {
    this.setDataValue('lastContent', Sequelize.stripNullByte(value))
  }

  @Column(DataType.TEXT({ length: 'long' }))
  get content(): string {
    return Sequelize.processData(this.getDataValue('content'), '')
  }
  set content(value: string) {
    this.setDataValue('content', Sequelize.stripNullByte(value))
  }

  @Column(DataType.INTEGER)
  length : number

  @Column(DataType.TEXT({ length: 'long' }))
  get authorship(): string {
    return Sequelize.processData(this.getDataValue('authorship'), [], JSON.parse)
  }
  set authorship(value: string) {
    this.setDataValue('authorship', value ? JSON.stringify(value) : value)
  }

  @ForeignKey(() => Note)
  @Column(DataType.UUID)
  noteId: string

  @BelongsTo(() => Note, { foreignKey: 'noteId', constraints: false, onDelete: 'CASCADE', hooks: true })
  note: Note;

  getNoteRevisions (note, callback) {
    Revision.findAll({
      where: {
        noteId: note.id
      },
      order: [['createdAt', 'DESC']]
    }).then(function (revisions) {
      var data : any[] = []
      for (var i = 0; i < revisions.length; i++) {
        var revision = revisions[i]
        data.push({
          time : moment(revision.createdAt).valueOf(),
          length: revision.length
        })
      }
      callback(null, data)
    }).catch(function (err) {
      callback(err, null)
    })
  }
  getPatchedNoteRevisionByTime (note, time, callback) {
    // find all revisions to prepare for all possible calculation
    Revision.findAll({
      where: {
        noteId: note.id
      },
      order: [['createdAt', 'DESC']]
    }).then(function (revisions) {
      if (revisions.length <= 0) return callback(null, null)
      // measure target revision position
      Revision.count({
        where: {
          noteId: note.id,
          createdAt: {
            [Op.gte]: time
          }
        },
      }).then(function (count) {
        if (count <= 0) return callback(null, null)
        sendDmpWorker({
          msg: 'get revision',
          revisions: revisions,
          count: count
        }, callback)
      }).catch(function (err) {
        return callback(err, null)
      })
    }).catch(function (err) {
      return callback(err, null)
    })
  }
  static checkAllNotesRevision (callback) {
    this.saveAllNotesRevision(function (err, notes) {
      if (err) return callback(err, null)
      if (!notes || notes.length <= 0) {
        return callback(null, notes)
      } else {
        this.checkAllNotesRevision(callback)
      }
    })
  }
  static saveAllNotesRevision (callback) {
    Note.findAll({
      // query all notes that need to save for revision
      where: {
        [Op.and]: [
          {
            lastchangeAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.and]: {
                  [Op.ne]: null,
                  [Op.gt]: Sequelize.col('createdAt')
                }
              }
            }
          },
          {
            savedAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.lt]: Sequelize.col('lastchangeAt')
              }
            }
          }
        ]
      }
    }).then(function (notes) {
      if (notes.length <= 0) return callback(null, notes)
      var savedNotes : any[] = []
      async.each(notes, function (note : any, _callback) {
        // revision saving policy: note not been modified for 5 mins or not save for 10 mins
        if (note.lastchangeAt && note.savedAt) {
          var lastchangeAt = moment(note.lastchangeAt)
          var savedAt = moment(note.savedAt)
          if (moment().isAfter(lastchangeAt.add(5, 'minutes'))) {
            savedNotes.push(note)
            this.saveNoteRevision(note, _callback)
          } else if (lastchangeAt.isAfter(savedAt.add(10, 'minutes'))) {
            savedNotes.push(note)
            this.saveNoteRevision(note, _callback)
          } else {
            return _callback(null, null)
          }
        } else {
          savedNotes.push(note)
          this.saveNoteRevision(note, _callback)
        }
      }, function (err) {
        if (err) {
          return callback(err, null)
        }
        // return null when no notes need saving at this moment but have delayed tasks to be done
        var result = ((savedNotes.length === 0) && (notes.length > savedNotes.length)) ? null : savedNotes
        return callback(null, result)
      })
    }).catch(function (err) {
      return callback(err, null)
    })
  }
  saveNoteRevision (note, callback) {
    Revision.findAll({
      where: {
        noteId: note.id
      },
      order: [['createdAt', 'DESC']]
    }).then(function (revisions) {
      if (revisions.length <= 0) {
        // if no revision available
        this.create({
          noteId: note.id,
          lastContent: note.content ? note.content : '',
          length: note.content ? note.content.length : 0,
          authorship: note.authorship
        }).then(function (revision) {
          this.finishSaveNoteRevision(note, revision, callback)
        }).catch(function (err) {
          return callback(err, null)
        })
      } else {
        var latestRevision = revisions[0]
        var lastContent = latestRevision.content || latestRevision.lastContent
        var content = note.content
        sendDmpWorker({
          msg: 'create patch',
          lastDoc: lastContent,
          currDoc: content
        }, function (err, patch) {
          if (err) logger.error('save note revision error', err)
          if (!patch) {
            // if patch is empty (means no difference) then just update the latest revision updated time
            latestRevision.changed('updatedAt', true)
            latestRevision.update({
              updatedAt: Date.now()
            }).then(function (revision) {
              this.finishSaveNoteRevision(note, revision, callback)
            }).catch(function (err) {
              return callback(err, null)
            })
          } else {
            this.create({
              noteId: note.id,
              patch: patch,
              content: note.content,
              length: note.content.length,
              authorship: note.authorship
            }).then(function (revision) {
              // clear last revision content to reduce db size
              latestRevision.update({
                content: null
              }).then(function () {
                this.finishSaveNoteRevision(note, revision, callback)
              }).catch(function (err) {
                return callback(err, null)
              })
            }).catch(function (err) {
              return callback(err, null)
            })
          }
        })
      }
    }).catch(function (err) {
      return callback(err, null)
    })
  }
  finishSaveNoteRevision (note, revision, callback) {
    note.update({
      savedAt: revision.updatedAt
    }).then(function () {
      return callback(null, revision)
    }).catch(function (err) {
      return callback(err, null)
    })
  }



}

