import { StringMap, TOptionsBase } from 'i18next'
import { IconProp } from '../../utils/iconProp'

export interface GeneralLinkProp {
  href: string;
  icon?: IconProp;
  className?: string
}

export interface LinkWithTextProps extends GeneralLinkProp {
  text: string;
}

export interface TranslatedLinkProps extends GeneralLinkProp{
  i18nKey: string;
  i18nOption?: (TOptionsBase & StringMap) | string
}
