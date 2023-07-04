# Supported YAML metadata

With a YAML frontmatter you can change certain metadata and aspects of your note.

First you need to insert syntax like this at the **start** of the note:
```yaml
---
YAML metas
---
```

Replace the "YAML metas" in this section with any YAML options as below.
You can also refer to this note's source code.

## title

This option will set the note title which prior than content title.

> default: not set

**Example**
```yml
title: meta title
```

## description

This option will set the note description as a `<meta name="description">` tag. This only affects the [Publish](../features#Share-Notes) function.

> default: not set

**Example**
```yml
description: meta description
```

## tags

This option will set the tags which prior than content tags.

> default: not set

**Example**
```yml
tags: features, cool, updated
```

## robots

This option will give below meta in the note head meta:
```xml
<meta name="robots" content="your_meta">
```
So you can prevent any search engine index your note by set `noindex, nofollow`.

> default: not set

**Example**
```yml
robots: noindex, nofollow
```

## lang

This option will set the language of the note.
Setting the language helps the browser to apply rules such as typography correctly.
You can find your the language code in ISO 639-1 standard:
<https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes>

> default: not set (which will be en)

**Example**
```yml
lang: ja-jp
```

## dir

This option specifies the direction of the text in this note.
You can only use whether `rtl` or `ltr`.
Look more at here:
<http://www.w3.org/International/questions/qa-html-dir>

> default: not set (which will be ltr)

**Example**
```yml
dir: rtl
```

## breaks

This option means the hardbreaks in the note will be parsed or be ignore.
The original markdown syntax breaks only if you put space twice, but HedgeDoc choose to breaks every time you enter a break.
You can only use whether `true` or `false`.

> default: not set (which will be true)

**Example**
```yml
breaks: false
```

## GA

This option allows you to enable Google Analytics with your ID.

> default: not set (which won't enable)

**Example**
```yml
GA: UA-12345667-8
```

## disqus

This option allows you to enable Disqus with your shortname.

> default: not set (which won't enable)

**Example**
```yml
disqus: hedgedoc
```

## type

This option allows you to switch the document view to the slide preview, to simplify live editing of presentations.

> default: not set

**Example:**
```yml
type: slide
```

## slideOptions

This option allows you to provide custom options to slide mode.

Slide mode is achieved using [Reveal](https://revealjs.com/), an HTML presentation framework.
The current stable version of HedgeDoc uses Reveal 3.

See the document below for more details on the available slide options:
<https://github.com/hakimel/reveal.js/blob/3.9.2/README.md#configuration>

You could also set slide theme which named in below css files:
<https://github.com/hakimel/reveal.js/tree/master/css/theme>

**Notice: always use two spaces as indention in YAML metadata!**

> default: not set (which use default slide options)

**Example**
```yml
slideOptions:
  transition: fade
  theme: white
```

## opengraph

This option allows you to override the default generated opengraph metadata.
See the [OpenGraph protocol documentation](https://ogp.me) for more information.

**Notice: always use two spaces as indention in YAML metadata!**

> default: not set (uses auto-generated metadata)

**Example**
```yml
opengraph:
  title: Special title for OpenGraph protocol
  image: https://dummyimage.com/600x600/000/fff
  image:type: image/png
```
