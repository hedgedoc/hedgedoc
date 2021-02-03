/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// import { RevealOptions } from 'reveal.js'

type iso6391 =
  'aa'
  | 'ab'
  | 'af'
  | 'am'
  | 'ar'
  | 'ar-ae'
  | 'ar-bh'
  | 'ar-dz'
  | 'ar-eg'
  | 'ar-iq'
  | 'ar-jo'
  | 'ar-kw'
  | 'ar-lb'
  | 'ar-ly'
  | 'ar-ma'
  | 'ar-om'
  | 'ar-qa'
  | 'ar-sa'
  | 'ar-sy'
  | 'ar-tn'
  | 'ar-ye'
  | 'as'
  | 'ay'
  | 'de-at'
  | 'de-ch'
  | 'de-li'
  | 'de-lu'
  | 'div'
  | 'dz'
  | 'el'
  | 'en'
  | 'en-au'
  | 'en-bz'
  | 'en-ca'
  | 'en-gb'
  | 'en-ie'
  | 'en-jm'
  | 'en-nz'
  | 'en-ph'
  | 'en-tt'
  | 'en-us'
  | 'en-za'
  | 'en-zw'
  | 'eo'
  | 'es'
  | 'es-ar'
  | 'es-bo'
  | 'es-cl'
  | 'es-co'
  | 'es-cr'
  | 'es-do'
  | 'es-ec'
  | 'es-es'
  | 'es-gt'
  | 'es-hn'
  | 'es-mx'
  | 'es-ni'
  | 'es-pa'
  | 'es-pe'
  | 'es-pr'
  | 'es-py'
  | 'es-sv'
  | 'es-us'
  | 'es-uy'
  | 'es-ve'
  | 'et'
  | 'eu'
  | 'fa'
  | 'fi'
  | 'fj'
  | 'fo'
  | 'fr'
  | 'fr-be'
  | 'fr-ca'
  | 'fr-ch'
  | 'fr-lu'
  | 'fr-mc'
  | 'fy'
  | 'ga'
  | 'gd'
  | 'gl'
  | 'gn'
  | 'gu'
  | 'ha'
  | 'he'
  | 'hi'
  | 'hr'
  | 'hu'
  | 'hy'
  | 'ia'
  | 'id'
  | 'ie'
  | 'ik'
  | 'in'
  | 'is'
  | 'it'
  | 'it-ch'
  | 'iw'
  | 'ja'
  | 'ji'
  | 'jw'
  | 'ka'
  | 'kk'
  | 'kl'
  | 'km'
  | 'kn'
  | 'ko'
  | 'kok'
  | 'ks'
  | 'ku'
  | 'ky'
  | 'kz'
  | 'la'
  | 'ln'
  | 'lo'
  | 'ls'
  | 'lt'
  | 'lv'
  | 'mg'
  | 'mi'
  | 'mk'
  | 'ml'
  | 'mn'
  | 'mo'
  | 'mr'
  | 'ms'
  | 'mt'
  | 'my'
  | 'na'
  | 'nb-no'
  | 'ne'
  | 'nl'
  | 'nl-be'
  | 'nn-no'
  | 'no'
  | 'oc'
  | 'om'
  | 'or'
  | 'pa'
  | 'pl'
  | 'ps'
  | 'pt'
  | 'pt-br'
  | 'qu'
  | 'rm'
  | 'rn'
  | 'ro'
  | 'ro-md'
  | 'ru'
  | 'ru-md'
  | 'rw'
  | 'sa'
  | 'sb'
  | 'sd'
  | 'sg'
  | 'sh'
  | 'si'
  | 'sk'
  | 'sl'
  | 'sm'
  | 'sn'
  | 'so'
  | 'sq'
  | 'sr'
  | 'ss'
  | 'st'
  | 'su'
  | 'sv'
  | 'sv-fi'
  | 'sw'
  | 'sx'
  | 'syr'
  | 'ta'
  | 'te'
  | 'tg'
  | 'th'
  | 'ti'
  | 'tk'
  | 'tl'
  | 'tn'
  | 'to'
  | 'tr'
  | 'ts'
  | 'tt'
  | 'tw'
  | 'uk'
  | 'ur'
  | 'us'
  | 'uz'
  | 'vi'
  | 'vo'
  | 'wo'
  | 'xh'
  | 'yi'
  | 'yo'
  | 'zh'
  | 'zh-cn'
  | 'zh-hk'
  | 'zh-mo'
  | 'zh-sg'
  | 'zh-tw'
  | 'zu'

export interface RawNoteFrontmatter {
  title: string | undefined
  description: string | undefined
  tags: string | string[] | undefined
  robots: string | undefined
  lang: string | undefined
  dir: string | undefined
  breaks: boolean | undefined
  GA: string | undefined
  disqus: string | undefined
  type: string | undefined
  slideOptions: unknown
  opengraph: { [key: string]: string } | null
}

export class NoteFrontmatter {
  title: string
  description: string
  tags: string[]
  deprecatedTagsSyntax: boolean
  robots: string
  lang: iso6391
  dir: 'ltr' | 'rtl'
  breaks: boolean
  GA: string
  disqus: string
  type: 'slide' | ''
  // slideOptions: RevealOptions
  opengraph: Map<string, string>

  constructor(rawData: RawNoteFrontmatter) {
    this.title = rawData?.title ?? ''
    this.description = rawData?.description ?? ''
    this.robots = rawData?.robots ?? ''
    this.breaks = rawData?.breaks ?? true
    this.GA = rawData?.GA ?? ''
    this.disqus = rawData?.disqus ?? ''

    this.type = (rawData?.type as NoteFrontmatter['type']) ?? ''
    this.lang = (rawData?.lang as iso6391) ?? 'en'
    this.dir = (rawData?.dir as NoteFrontmatter['dir']) ?? 'ltr'

    /* this.slideOptions = (rawData?.slideOptions as RevealOptions) ?? {
     transition: 'none',
     theme: 'white'
     } */
    if (typeof rawData?.tags === 'string') {
      this.tags = rawData?.tags?.split(',')
                         .map(entry => entry.trim()) ?? []
      this.deprecatedTagsSyntax = true
    } else if (typeof rawData?.tags === 'object') {
      this.tags = rawData?.tags?.filter(tag => tag !== null) ?? []
      this.deprecatedTagsSyntax = false
    } else {
      this.tags = []
      this.deprecatedTagsSyntax = false
    }
    this.opengraph = rawData?.opengraph ? new Map<string, string>(Object.entries(rawData.opengraph)) : new Map<string, string>()
  }
}
