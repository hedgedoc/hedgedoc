import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconProp } from '../../utils/iconProp'
import { ExternalLink } from './external-link'

export interface TranslatedLinkProps {
  i18nKey: string;
  href: string;
  icon?: IconProp;
  className?: string
}

const TranslatedExternalLink: React.FC<TranslatedLinkProps> = ({ i18nKey, ...props }) => {
  const { t } = useTranslation()
  return (
    <ExternalLink text={t(i18nKey)} {...props}/>
  )
}

export { TranslatedExternalLink }
