import { IconLookup, IconName, IconPrefix } from '@fortawesome/fontawesome-common-types'

// This icon prop is a workaround, because ESLint doesn't find the font awesome IconProp
export type IconProp = IconName | [IconPrefix, IconName] | IconLookup
