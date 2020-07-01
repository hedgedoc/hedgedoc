import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'

export const DocumentTitle: React.FC = () => {
  const branding = useSelector((state: ApplicationState) => state.backendConfig.branding)

  useEffect(() => {
    document.title = `CodiMD ${branding.name ? ` @ ${branding.name}` : ''}`
  }, [branding])

  return null
}
