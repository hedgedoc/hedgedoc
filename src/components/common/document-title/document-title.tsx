import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'

export interface DocumentTitleProps {
  title?: string
}

export const DocumentTitle: React.FC<DocumentTitleProps> = ({ title }) => {
  const brandingName = useSelector((state: ApplicationState) => state.config.branding.name)

  useEffect(() => {
    document.title = `${title ? title + ' - ' : ''}CodiMD ${brandingName ? ` @ ${brandingName}` : ''}`
  }, [brandingName, title])

  return null
}
