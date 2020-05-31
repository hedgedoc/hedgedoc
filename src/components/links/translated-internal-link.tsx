import React from 'react'
import { useTranslation } from 'react-i18next'
import { InternalLink, InternalLinkProp } from './internal-link'
import { TranslatedLinkProps } from './translated-external-link'

export const TranslatedInternalLink: React.FC<TranslatedLinkProps & InternalLinkProp> = ({ i18nKey, i18nOption, ...props }) => {
  const { t } = useTranslation()
  return (
    <InternalLink text={t(i18nKey, i18nOption)} {...props}/>
  )
}
