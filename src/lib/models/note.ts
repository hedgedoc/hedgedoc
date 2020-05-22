import {
  AfterCreate,
  AllowNull,
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript'

import { generate as shortIdGenerate, isValid as shortIdIsValid } from 'shortid'
import { Author, Revision, User } from './index'
import { processData, stripNullByte } from '../utils'
import Sequelize from 'sequelize'
import fs from 'fs'
import path from 'path'
import LZString from 'lz-string'
import base64url from 'base64url'
import markdownIt from 'markdown-it'
import metaMarked from 'meta-marked'
import cheerio from 'cheerio'
import async from 'async'
import moment from 'moment'
// eslint-disable-next-line @typescript-eslint/camelcase
import { diff_match_patch, patch_obj } from 'diff-match-patch'
import S from 'string'
import { config } from '../config'
import { logger } from '../logger'
import ot from '../ot'

const md = markdownIt()
// eslint-disable-next-line new-cap
const dmp = new diff_match_patch()

// permission types
enum PermissionEnum {
  freely = 'freely',
  editable = 'editable',
  limited = 'limited',
  locked = 'locked',
  protected = 'protected',
  private = 'private'
}

export class NoteMetadata {
  title: string
  description: string
  robots: string
  GA: string
  disqus: string
  slideOptions: any
  opengraph: any
}

@Table({ paranoid: false })
export class Note extends Model<Note> {
  @PrimaryKey
  @Default(Sequelize.UUIDV4)
  @Column(DataType.UUID)
  id: string

  @AllowNull(false)
  @Default(shortIdGenerate)
  @Unique
  @Column(DataType.STRING)
  shortid: string

  @Unique
  @Column(DataType.STRING)
  alias: string

  @Column(DataType.ENUM({ values: Object.keys(PermissionEnum).map(k => PermissionEnum[k]) }))
  permission: PermissionEnum

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  viewcount: number

  // ToDo: use @UpdatedAt instead? (https://www.npmjs.com/package/sequelize-typescript#createdat--updatedat--deletedat)
  @Column(DataType.DATE)
  lastchangeAt: Date

  // ToDo: use @UpdatedAt instead? (https://www.npmjs.com/package/sequelize-typescript#createdat--updatedat--deletedat)
  @Column(DataType.DATE)
  savedAt: Date

  @ForeignKey(() => User)
  @Column
  ownerId: string

  @BelongsTo(() => User, { foreignKey: 'ownerId', constraints: false, onDelete: 'CASCADE', hooks: true })
  owner: User

  @ForeignKey(() => User)
  @Column
  lastchangeuserId: string

  @BelongsTo(() => User, { foreignKey: 'lastchangeuserId', constraints: false })
  lastchangeuser: User

  @HasMany(() => Revision, { foreignKey: 'noteId', constraints: false })
  revisions: Revision[]

  @HasMany(() => Author, { foreignKey: 'noteId', constraints: false })
  authors: Author[]

  @Column(DataType.TEXT)
  get title (): string {
    return this.getDataValue('title') ?? ''
  }

  set title (value: string) {
    this.setDataValue('title', stripNullByte(value))
  }

  @Column(DataType.TEXT({ length: 'long' }))
  get content (): string {
    return this.getDataValue('content') ?? ''
  }

  set content (value: string) {
    this.setDataValue('content', stripNullByte(value))
  }

  @Column(DataType.TEXT({ length: 'long' }))
  get authorship (): string {
    return processData(this.getDataValue('authorship'), [], JSON.parse)
  }

  set authorship (value: string) {
    this.setDataValue('authorship', JSON.stringify(value))
  }

  @BeforeCreate
  static async defaultContentAndPermissions (note: Note): Promise<Note> {
    return await new Promise(function (resolve, reject) {
      // if no content specified then use default note
      if (!note.content) {
        let filePath: string
        if (!note.alias) {
          filePath = config.defaultNotePath
        } else {
          filePath = path.join(config.docsPath, note.alias + '.md')
        }
        if (Note.checkFileExist(filePath)) {
          const fsCreatedTime = moment(fs.statSync(filePath).ctime)
          const body = fs.readFileSync(filePath, 'utf8')
          note.title = Note.parseNoteTitle(body)
          note.content = body
          if (filePath !== config.defaultNotePath) {
            note.createdAt = fsCreatedTime
          }
        }
      }
      // if no permission specified and have owner then give default permission in config, else default permission is freely
      if (!note.permission) {
        if (note.owner) {
          // TODO: Might explode if the user-defined permission does not exist
          note.permission = PermissionEnum[config.defaultPermission]
        } else {
          note.permission = PermissionEnum.freely
        }
      }
      return resolve(note)
    })
  }

  @AfterCreate
  static saveRevision (note): Promise<Note> {
    return new Promise(function (resolve, reject) {
      Revision.saveNoteRevision(note, function (err, _) {
        if (err) {
          return reject(err)
        }
        return resolve(note)
      })
    })
  }

  static checkFileExist (filePath): boolean {
    try {
      return fs.statSync(filePath).isFile()
    } catch (err) {
      return false
    }
  }

  static encodeNoteId (id): string {
    // remove dashes in UUID and encode in url-safe base64
    const str = id.replace(/-/g, '')
    const hexStr = Buffer.from(str, 'hex')
    return base64url.encode(hexStr)
  }

  static decodeNoteId (encodedId): string {
    // decode from url-safe base64
    const id: string = base64url.toBuffer(encodedId).toString('hex')
    // add dashes between the UUID string parts
    const idParts: string[] = []
    idParts.push(id.substr(0, 8))
    idParts.push(id.substr(8, 4))
    idParts.push(id.substr(12, 4))
    idParts.push(id.substr(16, 4))
    idParts.push(id.substr(20, 12))
    return idParts.join('-')
  }

  static checkNoteIdValid (id): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const result = id.match(uuidRegex)
    return !!(result && result.length === 1)
  }

  static parseNoteId (noteId, callback): void {
    async.series({
      parseNoteIdByAlias: function (_callback) {
        // try to parse note id by alias (e.g. doc)
        Note.findOne({
          where: {
            alias: noteId
          }
        }).then(function (note) {
          if (note) {
            const filePath = path.join(config.docsPath, noteId + '.md')
            if (Note.checkFileExist(filePath)) {
              // if doc in filesystem have newer modified time than last change time
              // then will update the doc in db
              const fsModifiedTime = moment(fs.statSync(filePath).mtime)
              const dbModifiedTime = moment(note.lastchangeAt || note.createdAt)
              const body = fs.readFileSync(filePath, 'utf8')
              const contentLength = body.length
              const title = Note.parseNoteTitle(body)
              if (fsModifiedTime.isAfter(dbModifiedTime) && note.content !== body) {
                note.update({
                  title: title,
                  content: body,
                  lastchangeAt: fsModifiedTime
                }).then(function (note) {
                  Revision.saveNoteRevision(note, function (err, revision) {
                    if (err) return _callback(err, null)
                    // update authorship on after making revision of docs
                    const patch = dmp.patch_fromText(revision.patch)
                    const operations = Note.transformPatchToOperations(patch, contentLength)
                    let authorship = note.authorship
                    for (let i = 0; i < operations.length; i++) {
                      authorship = Note.updateAuthorshipByOperation(operations[i], null, authorship)
                    }
                    note.update({
                      authorship: authorship
                    }).then(function (note) {
                      return callback(null, note.id)
                    }).catch(function (err) {
                      return _callback(err, null)
                    })
                  })
                }).catch(function (err) {
                  return _callback(err, null)
                })
              } else {
                return callback(null, note.id)
              }
            } else {
              return callback(null, note.id)
            }
          } else {
            const filePath = path.join(config.docsPath, noteId + '.md')
            if (Note.checkFileExist(filePath)) {
              Note.create({
                alias: noteId,
                owner: null,
                permission: 'locked'
              }).then(function (note) {
                return callback(null, note.id)
              }).catch(function (err) {
                return _callback(err, null)
              })
            } else {
              return _callback(null, null)
            }
          }
        }).catch(function (err) {
          return _callback(err, null)
        })
      },
      // parse note id by LZString is deprecated, here for compability
      parseNoteIdByLZString: function (_callback) {
        // Calculate minimal string length for an UUID that is encoded
        // base64 encoded and optimize comparsion by using -1
        // this should make a lot of LZ-String parsing errors obsolete
        // as we can assume that a nodeId that is 48 chars or longer is a
        // noteID.
        const base64UuidLength = ((4 * 36) / 3) - 1
        if (!(noteId.length > base64UuidLength)) {
          return _callback(null, null)
        }
        // try to parse note id by LZString Base64
        try {
          const id = LZString.decompressFromBase64(noteId)
          if (id && Note.checkNoteIdValid(id)) {
            return callback(null, id)
          } else {
            return _callback(null, null)
          }
        } catch (err) {
          if (err.message === 'Cannot read property \'charAt\' of undefined') {
            logger.warning('Looks like we can not decode "' + noteId + '" with LZString. Can be ignored.')
          } else {
            logger.error(err)
          }
          return _callback(null, null)
        }
      },
      parseNoteIdByBase64Url: function (_callback) {
        // try to parse note id by base64url
        try {
          const id = Note.decodeNoteId(noteId)
          if (id && Note.checkNoteIdValid(id)) {
            return callback(null, id)
          } else {
            return _callback(null, null)
          }
        } catch (err) {
          logger.error(err)
          return _callback(null, null)
        }
      },
      parseNoteIdByShortId: function (_callback) {
        // try to parse note id by shortId
        try {
          if (shortIdIsValid(noteId)) {
            Note.findOne({
              where: {
                shortid: noteId
              }
            }).then(function (note) {
              if (!note) return _callback(null, null)
              return callback(null, note.id)
            }).catch(function (err) {
              return _callback(err, null)
            })
          } else {
            return _callback(null, null)
          }
        } catch (err) {
          return _callback(err, null)
        }
      }
    }, function (err, _) {
      if (err) {
        logger.error(err)
        return callback(err, null)
      }
      return callback(null, null)
    })
  }

  static parseNoteTitle (body): string {
    const parsed = Note.extractMeta(body)
    const $ = cheerio.load(md.render(parsed.markdown))
    return Note.extractNoteTitle(parsed.meta, $)
  }

  static extractNoteTitle (meta, $): string {
    let title = ''
    if (meta.title && (typeof meta.title === 'string' || typeof meta.title === 'number')) {
      title = meta.title
    } else {
      const h1s = $('h1')
      if (h1s.length > 0 && h1s.first().text().split('\n').length === 1) {
        title = S(h1s.first().text()).stripTags().s
      }
    }
    if (!title) title = 'Untitled'
    return title
  }

  static generateDescription (markdown): string {
    return markdown.substr(0, 100).replace(/(?:\r\n|\r|\n)/g, ' ')
  }

  static decodeTitle (title): string {
    return title || 'Untitled'
  }

  static generateWebTitle (title): string {
    title = !title || title === 'Untitled' ? 'CodiMD - Collaborative markdown notes' : title + ' - CodiMD'
    return title
  }

  static extractNoteTags (meta, $): string[] {
    const tags: string[] = []
    const rawtags: string[] = []
    if (meta.tags && (typeof meta.tags === 'string' || typeof meta.tags === 'number')) {
      const metaTags = ('' + meta.tags).split(',')
      for (let i = 0; i < metaTags.length; i++) {
        const text: string = metaTags[i].trim()
        if (text) rawtags.push(text)
      }
    } else {
      const h6s = $('h6')
      h6s.each(function (key, value) {
        if (/^tags/gmi.test($(value).text())) {
          const codes = $(value).find('code')
          for (let i = 0; i < codes.length; i++) {
            const text = S($(codes[i]).text().trim()).stripTags().s
            if (text) rawtags.push(text)
          }
        }
      })
    }
    for (let i = 0; i < rawtags.length; i++) {
      let found = false
      for (let j = 0; j < tags.length; j++) {
        if (tags[j] === rawtags[i]) {
          found = true
          break
        }
      }
      if (!found) {
        tags.push(rawtags[i])
      }
    }
    return tags
  }

  static extractMeta (content): any {
    try {
      const obj = metaMarked(content)
      if (!obj.markdown) obj.markdown = ''
      if (!obj.meta) obj.meta = {}
      return obj
    } catch (err) {
      return {
        markdown: content,
        meta: {}
      }
    }
  }

  static parseMeta (meta): NoteMetadata {
    const _meta = new NoteMetadata()
    if (meta) {
      if (meta.title && (typeof meta.title === 'string' || typeof meta.title === 'number')) {
        _meta.title = meta.title
      }
      if (meta.description && (typeof meta.description === 'string' || typeof meta.description === 'number')) {
        _meta.description = meta.description
      }
      if (meta.robots && (typeof meta.robots === 'string' || typeof meta.robots === 'number')) {
        _meta.robots = meta.robots
      }
      if (meta.GA && (typeof meta.GA === 'string' || typeof meta.GA === 'number')) {
        _meta.GA = meta.GA
      }
      if (meta.disqus && (typeof meta.disqus === 'string' || typeof meta.disqus === 'number')) {
        _meta.disqus = meta.disqus
      }
      if (meta.slideOptions && (typeof meta.slideOptions === 'object')) {
        _meta.slideOptions = meta.slideOptions
      }
      if (meta.opengraph && (typeof meta.opengraph === 'object')) {
        _meta.opengraph = meta.opengraph
      }
    }
    return _meta
  }

  static parseOpengraph (meta, title): any {
    let _ogdata: any = {}
    if (meta.opengraph) {
      _ogdata = meta.opengraph
    }
    if (!(_ogdata.title && (typeof _ogdata.title === 'string' || typeof _ogdata.title === 'number'))) {
      _ogdata.title = title
    }
    if (!(_ogdata.description && (typeof _ogdata.description === 'string' || typeof _ogdata.description === 'number'))) {
      _ogdata.description = meta.description || ''
    }
    if (!(_ogdata.type && (typeof _ogdata.type === 'string'))) {
      _ogdata.type = 'website'
    }
    return _ogdata
  }

  static updateAuthorshipByOperation (operation, userId: string|null, authorships): any {
    let index = 0
    const timestamp = Date.now()
    for (let i = 0; i < operation.length; i++) {
      const op = operation[i]
      if (ot.TextOperation.isRetain(op)) {
        index += op
      } else if (ot.TextOperation.isInsert(op)) {
        const opStart = index
        const opEnd = index + op.length
        let inserted = false
        // authorship format: [userId, startPos, endPos, createdAt, updatedAt]
        if (authorships.length <= 0) authorships.push([userId, opStart, opEnd, timestamp, timestamp])
        else {
          for (let j = 0; j < authorships.length; j++) {
            const authorship = authorships[j]
            if (!inserted) {
              const nextAuthorship = authorships[j + 1] || -1
              if ((nextAuthorship !== -1 && nextAuthorship[1] >= opEnd) || j >= authorships.length - 1) {
                if (authorship[1] < opStart && authorship[2] > opStart) {
                  // divide
                  const postLength = authorship[2] - opStart
                  authorship[2] = opStart
                  authorship[4] = timestamp
                  authorships.splice(j + 1, 0, [userId, opStart, opEnd, timestamp, timestamp])
                  authorships.splice(j + 2, 0, [authorship[0], opEnd, opEnd + postLength, authorship[3], timestamp])
                  j += 2
                  inserted = true
                } else if (authorship[1] >= opStart) {
                  authorships.splice(j, 0, [userId, opStart, opEnd, timestamp, timestamp])
                  j += 1
                  inserted = true
                } else if (authorship[2] <= opStart) {
                  authorships.splice(j + 1, 0, [userId, opStart, opEnd, timestamp, timestamp])
                  j += 1
                  inserted = true
                }
              }
            }
            if (authorship[1] >= opStart) {
              authorship[1] += op.length
              authorship[2] += op.length
            }
          }
        }
        index += op.length
      } else if (ot.TextOperation.isDelete(op)) {
        const opStart = index
        const opEnd = index - op
        if (operation.length === 1) {
          authorships = []
        } else if (authorships.length > 0) {
          for (let j = 0; j < authorships.length; j++) {
            const authorship = authorships[j]
            if (authorship[1] >= opStart && authorship[1] <= opEnd && authorship[2] >= opStart && authorship[2] <= opEnd) {
              authorships.splice(j, 1)
              j -= 1
            } else if (authorship[1] < opStart && authorship[1] < opEnd && authorship[2] > opStart && authorship[2] > opEnd) {
              authorship[2] += op
              authorship[4] = timestamp
            } else if (authorship[2] >= opStart && authorship[2] <= opEnd) {
              authorship[2] = opStart
              authorship[4] = timestamp
            } else if (authorship[1] >= opStart && authorship[1] <= opEnd) {
              authorship[1] = opEnd
              authorship[4] = timestamp
            }
            if (authorship[1] >= opEnd) {
              authorship[1] += op
              authorship[2] += op
            }
          }
        }
        index += op
      }
    }
    // merge
    for (let j = 0; j < authorships.length; j++) {
      const authorship = authorships[j]
      for (let k = j + 1; k < authorships.length; k++) {
        const nextAuthorship = authorships[k]
        if (nextAuthorship && authorship[0] === nextAuthorship[0] && authorship[2] === nextAuthorship[1]) {
          const minTimestamp = Math.min(authorship[3], nextAuthorship[3])
          const maxTimestamp = Math.max(authorship[3], nextAuthorship[3])
          authorships.splice(j, 1, [authorship[0], authorship[1], nextAuthorship[2], minTimestamp, maxTimestamp])
          authorships.splice(k, 1)
          j -= 1
          break
        }
      }
    }
    // clear
    for (let j = 0; j < authorships.length; j++) {
      const authorship = authorships[j]
      if (!authorship[0]) {
        authorships.splice(j, 1)
        j -= 1
      }
    }
    return authorships
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  static transformPatchToOperations (patch: patch_obj[], contentLength): number[][] {
    const operations: number[][] = []
    if (patch.length > 0) {
      // calculate original content length
      for (let j = patch.length - 1; j >= 0; j--) {
        const p = patch[j]
        for (let i = 0; i < p.diffs.length; i++) {
          const diff = p.diffs[i]
          switch (diff[0]) {
            case 1: // insert
              contentLength -= diff[1].length
              break
            case -1: // delete
              contentLength += diff[1].length
              break
          }
        }
      }
      // generate operations
      let bias = 0
      let lengthBias = 0
      for (let j = 0; j < patch.length; j++) {
        const operation: number[] = []
        const p = patch[j]
        let currIndex = p.start1 || 0
        const currLength = contentLength - bias
        for (let i = 0; i < p.diffs.length; i++) {
          const diff = p.diffs[i]
          switch (diff[0]) {
            case 0: // retain
              if (i === 0) {
                // first
                operation.push(currIndex + diff[1].length)
              } else if (i !== p.diffs.length - 1) {
                // mid
                operation.push(diff[1].length)
              } else {
                // last
                operation.push(currLength + lengthBias - currIndex)
              }
              currIndex += diff[1].length
              break
            case 1: // insert
              operation.push(diff[1].length)
              lengthBias += diff[1].length
              currIndex += diff[1].length
              break
            case -1: // delete
              operation.push(-diff[1].length)
              bias += diff[1].length
              currIndex += diff[1].length
              break
          }
        }
        operations.push(operation)
      }
    }
    return operations
  }

  static parseNoteInfo (body): { title: string; tags: string[] } {
    const parsed = Note.extractMeta(body)
    const $ = cheerio.load(md.render(parsed.markdown))
    return {
      title: Note.extractNoteTitle(parsed.meta, $),
      tags: Note.extractNoteTags(parsed.meta, $)
    }
  }
}
