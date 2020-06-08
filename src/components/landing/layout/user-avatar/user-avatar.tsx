import React from 'react'
import './user-avatar.scss'

export interface UserAvatarProps {
    name: string;
    photo: string;
    additionalClasses?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, photo, additionalClasses = '' }) => {
  // ToDo: add Translation Key for Avatar of ${name}
  return (
    <span className={'d-inline-flex align-items-center ' + additionalClasses}>
      <img
        src={photo}
        className="user-avatar"
        alt={`Avatar of ${name}`}
      />
      <span className="mx-1 user-name">{name}</span>
    </span>
  )
}

export { UserAvatar }
