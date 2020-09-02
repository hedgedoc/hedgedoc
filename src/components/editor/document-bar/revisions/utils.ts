import { Revision } from '../../../../api/revisions'
import { getUserById } from '../../../../api/users'
import { UserResponse } from '../../../../api/users/types'

const userResponseCache = new Map<string, UserResponse>()

export const downloadRevision = (noteId: string, revision: Revision | null): void => {
  if (!revision) {
    return
  }
  const encoded = Buffer.from(revision.content).toString('base64')
  const wrapper = document.createElement('a')
  wrapper.download = `${noteId}-${revision.timestamp}.md`
  wrapper.href = `data:text/markdown;charset=utf-8;base64,${encoded}`
  document.body.appendChild(wrapper)
  wrapper.click()
  document.body.removeChild(wrapper)
}

export const getUserDataForRevision = (authors: string[]): UserResponse[] => {
  const users: UserResponse[] = []
  authors.forEach((author, index) => {
    if (index > 9) {
      return
    }
    const cacheEntry = userResponseCache.get(author)
    if (cacheEntry) {
      users.push(cacheEntry)
      return
    }
    getUserById(author)
      .then(userData => {
        users.push(userData)
        userResponseCache.set(author, userData)
      })
      .catch((error) => console.error(error))
  })
  return users
}
