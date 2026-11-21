import type { Handle, RemixNode } from 'remix/component'

import { clientAssets } from '../client-assets.ts'

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
    let { entry, css } = clientAssets

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
          {css.map((file) => (
            <link key={file.href} rel="stylesheet" href={file.href} />
          ))}
          {head}
          {entry ? <script type="module" src={entry}></script> : null}
        </head>
        <body>{children}</body>
      </html>
    )
  }
}
