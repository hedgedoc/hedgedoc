// import { RevealOptions } from 'reveal.js'

type iso6391 = 'aa' | 'ab' | 'af' | 'am' | 'ar' | 'ar-ae' | 'ar-bh' | 'ar-dz' | 'ar-eg' | 'ar-iq' | 'ar-jo' | 'ar-kw' | 'ar-lb' | 'ar-ly' | 'ar-ma' | 'ar-om' | 'ar-qa' | 'ar-sa' | 'ar-sy' | 'ar-tn' | 'ar-ye' | 'as' | 'ay' | 'de-at' | 'de-ch' | 'de-li' | 'de-lu' | 'div' | 'dz' | 'el' | 'en' | 'en-au' | 'en-bz' | 'en-ca' | 'en-gb' | 'en-ie' | 'en-jm' | 'en-nz' | 'en-ph' | 'en-tt' | 'en-us' | 'en-za' | 'en-zw' | 'eo' | 'es' | 'es-ar' | 'es-bo' | 'es-cl' | 'es-co' | 'es-cr' | 'es-do' | 'es-ec' | 'es-es' | 'es-gt' | 'es-hn' | 'es-mx' | 'es-ni' | 'es-pa' | 'es-pe' | 'es-pr' | 'es-py' | 'es-sv' | 'es-us' | 'es-uy' | 'es-ve' | 'et' | 'eu' | 'fa' | 'fi' | 'fj' | 'fo' | 'fr' | 'fr-be' | 'fr-ca' | 'fr-ch' | 'fr-lu' | 'fr-mc' | 'fy' | 'ga' | 'gd' | 'gl' | 'gn' | 'gu' | 'ha' | 'he' | 'hi' | 'hr' | 'hu' | 'hy' | 'ia' | 'id' | 'ie' | 'ik' | 'in' | 'is' | 'it' | 'it-ch' | 'iw' | 'ja' | 'ji' | 'jw' | 'ka' | 'kk' | 'kl' | 'km' | 'kn' | 'ko' | 'kok' | 'ks' | 'ku' | 'ky' | 'kz' | 'la' | 'ln' | 'lo' | 'ls' | 'lt' | 'lv' | 'mg' | 'mi' | 'mk' | 'ml' | 'mn' | 'mo' | 'mr' | 'ms' | 'mt' | 'my' | 'na' | 'nb-no' | 'ne' | 'nl' | 'nl-be' | 'nn-no' | 'no' | 'oc' | 'om' | 'or' | 'pa' | 'pl' | 'ps' | 'pt' | 'pt-br' | 'qu' | 'rm' | 'rn' | 'ro' | 'ro-md' | 'ru' | 'ru-md' | 'rw' | 'sa' | 'sb' | 'sd' | 'sg' | 'sh' | 'si' | 'sk' | 'sl' | 'sm' | 'sn' | 'so' | 'sq' | 'sr' | 'ss' | 'st' | 'su' | 'sv' | 'sv-fi' | 'sw' | 'sx' | 'syr' | 'ta' | 'te' | 'tg' | 'th' | 'ti' | 'tk' | 'tl' | 'tn' | 'to' | 'tr' | 'ts' | 'tt' | 'tw' | 'uk' | 'ur' | 'us' | 'uz' | 'vi' | 'vo' | 'wo' | 'xh' | 'yi' | 'yo' | 'zh' | 'zh-cn' | 'zh-hk' | 'zh-mo' | 'zh-sg' | 'zh-tw' | 'zu'

export interface RawYAMLMetadata {
  title: string | undefined
  description: string | undefined
  tags: string | undefined
  robots: string | undefined
  lang: string | undefined
  dir: string | undefined
  breaks: boolean | undefined
  GA: string | undefined
  disqus: string | undefined
  type: string | undefined
  slideOptions: any
  opengraph: any
}

export class YAMLMetaData {
  title: string
  description: string
  tags: string[]
  robots: string
  lang: iso6391
  dir: 'ltr' | 'rtl'
  breaks: boolean
  GA: string
  disqus: string
  type: 'slide' | ''
  // slideOptions: RevealOptions
  opengraph: Map<string, string>

  constructor (rawData: RawYAMLMetadata) {
    this.title = rawData?.title ?? ''
    this.description = rawData?.description ?? ''
    this.robots = rawData?.robots ?? ''
    this.breaks = rawData?.breaks ?? true
    this.GA = rawData?.GA ?? ''
    this.disqus = rawData?.disqus ?? ''

    this.type = (rawData?.type as YAMLMetaData['type']) ?? ''
    this.lang = (rawData?.lang as iso6391) ?? 'en'
    this.dir = (rawData?.dir as YAMLMetaData['dir']) ?? 'ltr'

    /* this.slideOptions = (rawData?.slideOptions as RevealOptions) ?? {
      transition: 'none',
      theme: 'white'
    } */
    this.tags = rawData?.tags?.split(',').map(entry => entry.trim()) ?? []
    this.opengraph = rawData?.opengraph ? new Map<string, string>(Object.entries(rawData.opengraph)) : new Map<string, string>()
  }
}
