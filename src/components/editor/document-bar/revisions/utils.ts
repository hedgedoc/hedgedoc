import { Revision } from '../../../../api/revisions/types'
import { getUserById } from '../../../../api/users'
import { UserResponse } from '../../../../api/users/types'
import { download } from '../../../common/download/download'

export const downloadRevision = (noteId: string, revision: Revision | null): void => {
  if (!revision) {
    return
  }
  download(revision.content, `${noteId}-${revision.timestamp}.md`, 'text/markdown')
}

export const getUserDataForRevision = (authors: string[]): UserResponse[] => {
  const users: UserResponse[] = []
  authors.forEach((author, index) => {
    if (index > 9) {
      return
    }
    getUserById(author)
      .then(userData => {
        users.push(userData)
      })
      .catch((error) => console.error(error))
  })
  return users
}
