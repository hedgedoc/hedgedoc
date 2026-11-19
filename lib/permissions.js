export const allowedPermissionValues = ['freely', 'editable', 'limited', 'locked', 'protected', 'private']

export function checkViewPermission (loginUserId, note) {
  const permission = note.permission

  // Private notes should only be readable to their owner
  if (permission === 'private') {
    return !!loginUserId && loginUserId === note.ownerId
  }

  // Limited and protected notes should be readable by all logged-in users
  if (permission === 'limited' || permission === 'protected') {
    return !!loginUserId
  }

  // Freely, Editable and Locked notes should be readable by everyone
  if (permission === 'freely' || permission === 'editable' || permission === 'locked') {
    return true
  }

  // Invalid permission
  return false
}
