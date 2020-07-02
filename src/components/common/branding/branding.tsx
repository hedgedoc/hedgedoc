import React from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { ShowIf } from '../show-if/show-if'
import './branding.scss'

export interface BrandingProps {
  inline?: boolean
}

export const Branding: React.FC<BrandingProps> = ({ inline = false }) => {
  const branding = useSelector((state: ApplicationState) => state.backendConfig.branding)
  const showBranding = !!branding.name || !!branding.logo

  return (
    <ShowIf condition={showBranding}>
      <strong className={`mx-1 ${inline ? 'inline-size' : 'regular-size'}`} >@</strong>
      {
        branding.logo
          ? <img
            src={branding.logo}
            alt={branding.name}
            title={branding.name}
            className={inline ? 'inline-size' : 'regular-size'}
          />
          : branding.name
      }
    </ShowIf>
  )
}
