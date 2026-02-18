'use strict'
// external modules
const Sequelize = require('sequelize')
import async = require('async')
import moment = require('moment')
import * as childProcess from 'child_process'
import { nanoid } from 'nanoid'
import * as path from 'path'

const Op = Sequelize.Op

// core
import logger = require('../logger')

interface DmpWorkerMessage {
  msg: string
  cacheKey: string
  error?: any
  result?: any
}

type DmpCallback = (err: any, result: any) => void

let dmpWorker: childProcess.ChildProcess | null = createDmpWorker()
const dmpCallbackCache: Record<string, DmpCallback> = {}

function createDmpWorker (): childProcess.ChildProcess {
  const worker = childProcess.fork(path.resolve(__dirname, '../workers/dmpWorker.js'), {
    stdio: 'ignore'
  })
  logger.debug('dmp worker process started')
  worker.on('message', function (data: DmpWorkerMessage) {
    if (!data || !data.msg || !data.cacheKey) {
      return logger.error('dmp worker error: not enough data on message')
    }
    const cacheKey = data.cacheKey
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
  worker.on('close', function (code: number | null) {
    dmpWorker = null
    logger.debug(`dmp worker process exited with code ${code}`)
  })
  return worker
}

function sendDmpWorker (data: any, callback: DmpCallback): void {
  if (!dmpWorker) dmpWorker = createDmpWorker()
  const cacheKey = Date.now() + '_' + nanoid()
  dmpCallbackCache[cacheKey] = callback
  data = Object.assign(data, {
    cacheKey
  })
  dmpWorker.send(data)
}

module.exports = function (sequelize: any, DataTypes: any): any {
  const Revision = sequelize.define('Revision', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    patch: {
      type: DataTypes.TEXT('long'),
      get: function (this: any) {
        return sequelize.processData(this.getDataValue('patch'), '')
      },
      set: function (this: any, value: string) {
        this.setDataValue('patch', sequelize.stripNullByte(value))
      }
    },
    lastContent: {
      type: DataTypes.TEXT('long'),
      get: function (this: any) {
        return sequelize.processData(this.getDataValue('lastContent'), '')
      },
      set: function (this: any, value: string) {
        this.setDataValue('lastContent', sequelize.stripNullByte(value))
      }
    },
    content: {
      type: DataTypes.TEXT('long'),
      get: function (this: any) {
        return sequelize.processData(this.getDataValue('content'), '')
      },
      set: function (this: any, value: string) {
        this.setDataValue('content', sequelize.stripNullByte(value))
      }
    },
    length: {
      type: DataTypes.INTEGER
    },
    authorship: {
      type: DataTypes.TEXT('long'),
      get: function (this: any) {
        return sequelize.processData(this.getDataValue('authorship'), [], JSON.parse)
      },
      set: function (this: any, value: any) {
        this.setDataValue('authorship', value ? JSON.stringify(value) : value)
      }
    }
  })

  Revision.associate = function (models: any): void {
    Revision.belongsTo(models.Note, {
      foreignKey: 'noteId',
      as: 'note',
      constraints: false,
      onDelete: 'CASCADE',
      hooks: true
    })
  }
  Revision.getNoteRevisions = function (note: any, callback: DmpCallback): void {
    Revision.findAll({
      where: {
        noteId: note.id
      },
      order: [['createdAt', 'DESC']]
    }).then(function (revisions: any[]) {
      const data: Array<{ time: number; length: number }> = []
      for (let i = 0, l = revisions.length; i < l; i++) {
        const revision = revisions[i]
        data.push({
          time: moment(revision.createdAt).valueOf(),
          length: revision.length
        })
      }
      callback(null, data)
    }).catch(function (err: any) {
      callback(err, null)
    })
  }
  Revision.getPatchedNoteRevisionByTime = function (note: any, time: any, callback: DmpCallback): void {
    // find all revisions to prepare for all possible calculation
    Revision.findAll({
      where: {
        noteId: note.id
      },
      order: [['createdAt', 'DESC']]
    }).then(function (revisions: any[]) {
      if (revisions.length <= 0) return callback(null, null)
      // measure target revision position
      Revision.count({
        where: {
          noteId: note.id,
          createdAt: {
            [Op.gte]: time
          }
        },
        order: [['createdAt', 'DESC']]
      }).then(function (count: number) {
        if (count <= 0) return callback(null, null)
        sendDmpWorker({
          msg: 'get revision',
          revisions,
          count
        }, callback)
      }).catch(function (err: any) {
        return callback(err, null)
      })
    }).catch(function (err: any) {
      return callback(err, null)
    })
  }
  Revision.checkAllNotesRevision = function (callback: DmpCallback): void {
    Revision.saveAllNotesRevision(function (err: any, notes: any) {
      if (err) return callback(err, null)
      if (!notes || notes.length <= 0) {
        return callback(null, notes)
      } else {
        Revision.checkAllNotesRevision(callback)
      }
    })
  }
  Revision.saveAllNotesRevision = function (callback: DmpCallback): void {
    sequelize.models.Note.findAll({
      // query all notes that need to save for revision
      where: {
        [Op.and]: [
          {
            lastchangeAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.and]: {
                  [Op.ne]: null,
                  [Op.gt]: sequelize.col('createdAt')
                }
              }
            }
          },
          {
            savedAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.lt]: sequelize.col('lastchangeAt')
              }
            }
          }
        ]
      }
    }).then(function (notes: any[]) {
      if (notes.length <= 0) return callback(null, notes)
      const savedNotes: any[] = []
      async.each(notes, function (note: any, _callback: any) {
        // revision saving policy: note not been modified for 5 mins or not save for 10 mins
        if (note.lastchangeAt && note.savedAt) {
          const lastchangeAt = moment(note.lastchangeAt)
          const savedAt = moment(note.savedAt)
          if (moment().isAfter(lastchangeAt.add(5, 'minutes'))) {
            savedNotes.push(note)
            Revision.saveNoteRevision(note, _callback)
          } else if (lastchangeAt.isAfter(savedAt.add(10, 'minutes'))) {
            savedNotes.push(note)
            Revision.saveNoteRevision(note, _callback)
          } else {
            return _callback(null, null)
          }
        } else {
          savedNotes.push(note)
          Revision.saveNoteRevision(note, _callback)
        }
      }, function (err: any) {
        if (err) {
          return callback(err, null)
        }
        // return null when no notes need saving at this moment but have delayed tasks to be done
        const result = ((savedNotes.length === 0) && (notes.length > savedNotes.length)) ? null : savedNotes
        return callback(null, result)
      })
    }).catch(function (err: any) {
      return callback(err, null)
    })
  }
  Revision.saveNoteRevision = function (note: any, callback: DmpCallback): void {
    Revision.findAll({
      where: {
        noteId: note.id
      },
      order: [['createdAt', 'DESC']]
    }).then(function (revisions: any[]) {
      if (revisions.length <= 0) {
        // if no revision available
        Revision.create({
          noteId: note.id,
          lastContent: note.content ? note.content : '',
          length: note.content ? note.content.length : 0,
          authorship: note.authorship
        }).then(function (revision: any) {
          Revision.finishSaveNoteRevision(note, revision, callback)
        }).catch(function (err: any) {
          return callback(err, null)
        })
      } else {
        const latestRevision = revisions[0]
        const lastContent = latestRevision.content || latestRevision.lastContent
        const content = note.content
        sendDmpWorker({
          msg: 'create patch',
          lastDoc: lastContent,
          currDoc: content
        }, function (err: any, patch: any) {
          if (err) logger.error('save note revision error', err)
          if (!patch) {
            // if patch is empty (means no difference) then just update the latest revision updated time
            latestRevision.changed('updatedAt', true)
            latestRevision.update({
              updatedAt: Date.now()
            }).then(function (revision: any) {
              Revision.finishSaveNoteRevision(note, revision, callback)
            }).catch(function (err: any) {
              return callback(err, null)
            })
          } else {
            Revision.create({
              noteId: note.id,
              patch,
              content: note.content,
              length: note.content.length,
              authorship: note.authorship
            }).then(function (revision: any) {
              // clear last revision content to reduce db size
              latestRevision.update({
                content: null
              }).then(function () {
                Revision.finishSaveNoteRevision(note, revision, callback)
              }).catch(function (err: any) {
                return callback(err, null)
              })
            }).catch(function (err: any) {
              return callback(err, null)
            })
          }
        })
      }
    }).catch(function (err: any) {
      return callback(err, null)
    })
  }
  Revision.finishSaveNoteRevision = function (note: any, revision: any, callback: DmpCallback): void {
    note.update({
      savedAt: revision.updatedAt
    }).then(function () {
      return callback(null, revision)
    }).catch(function (err: any) {
      return callback(err, null)
    })
  }

  return Revision
}
