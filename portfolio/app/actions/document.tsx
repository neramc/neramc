import type { Handle, RemixNode } from 'remix/component'
import { ImportMap } from 'remix/component/server'

import { scriptEntry, stylesheetHref } from '../assets.ts'

export interface DocumentProps {
  children?: RemixNode
  head?: RemixNode
  title?: string
  description?: string
}

const SITE_NAME = 'neramc'
const DEFAULT_DESCRIPTION = '웹과 데스크톱 앱을 만드는 neramc의 포트폴리오. I build web apps and native desktop tools.'

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let { children, head, title, description = DEFAULT_DESCRIPTION } = handle.props
    let fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — 웹 & 데스크톱 개발자`
    let { href, importMap, preloads } = scriptEntry

    return (
      <html lang="ko">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light dark" />
          <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ece8e2" />
          <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#141012" />
          <meta name="description" content={description} />
          <meta property="og:title" content={fullTitle} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <title>{fullTitle}</title>
          <link rel="stylesheet" href={stylesheetHref} />
          {head}
          <ImportMap value={importMap} />
          {preloads.map((preloadHref) => (
            <link key={preloadHref} rel="modulepreload" href={preloadHref} />
          ))}
          <script type="module" src={href}></script>
        </head>
        <body>{children}</body>
      </html>
    )
  }
}
