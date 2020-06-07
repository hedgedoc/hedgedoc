import React from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from './external-link'
import { TranslatedLinkProps } from './types'

export const TranslatedExternalLink: React.FC<TranslatedLinkProps> = ({ i18nKey, i18nOption, ...props }) => {
  const { t } = useTranslation()
  return (
    <ExternalLink text={t(i18nKey, i18nOption)} {...props}/>
  )
}
