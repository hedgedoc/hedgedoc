import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'

export interface DocumentTitleProps {
  title?: string
}

export const DocumentTitle: React.FC<DocumentTitleProps> = ({ title }) => {
  const branding = useSelector((state: ApplicationState) => state.config.branding)

  useEffect(() => {
    document.title = `${title ? title + ' - ' : ''}CodiMD ${branding.name ? ` @ ${branding.name}` : ''}`
  }, [branding, title])

  return null
}
