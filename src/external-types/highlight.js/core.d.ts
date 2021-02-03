/*
 SPDX-FileCopyrightText: Copyright (c) 2006, Ivan Sagalaev

 SPDX-License-Identifier: BSD-3-Clause
 */
declare module 'highlight.js/lib/core' {
  export = hljs;
}

declare module 'highlight.js/lib/languages/*' {
  export default function (hljs?: hljs): LanguageDetail;
}
