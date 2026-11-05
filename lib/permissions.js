export function checkViewPermission (req, note) {
  const permission = note.permission

  // Private notes should only be readable to their owner
  if (permission === 'private') {
    return req.user && (req.user.id === note.owner || req.user.id === note.ownerId)
  }

  // Limited and protected notes should be readable by all logged-in users
  if (permission === 'limited' || permission === 'protected') {
    return req.user
  }

  // Freely, Editable and Locked notes should be readable by everyone
  if (permission === 'freely' || permission === 'editable' || permission === 'locked') {
    return true
  }

  // Invalid permission
  return false
}
