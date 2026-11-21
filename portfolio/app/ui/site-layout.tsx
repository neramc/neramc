import type { Handle, RemixNode } from 'remix/component'
import { css } from 'remix/component'

import { profile } from '../data/projects.ts'
import { routes } from '../routes.ts'
import { PixelIcon, PixelText } from './pixel.tsx'

type Section = 'home' | 'projects'

export function SiteLayout(handle: Handle<{ current?: Section; children?: RemixNode }>) {
  return () => {
    let { current, children } = handle.props
    return (
      <div mix={shellStyle}>
        <a href="#main" class="sr-only">
          본문으로 건너뛰기
        </a>
        <header mix={headerStyle}>
          <a href={routes.home.href()} mix={logoStyle} aria-label="neramc 홈">
            <PixelIcon name="pickaxe" size={2} />
            <PixelText text="NERAMC" size={3} />
          </a>
          <nav aria-label="주요 메뉴" mix={navStyle}>
            <a
              href={routes.projects.index.href()}
              aria-current={current === 'projects' ? 'page' : undefined}
            >
              인벤토리
            </a>
            <a href={profile.github} rel="me">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </header>
        <main id="main" mix={mainStyle}>
          {children}
        </main>
        <footer mix={footerStyle}>
          <p class="thanks" aria-label="Thanks for visiting! +1 XP">
            <PixelText text="THANKS FOR VISITING!" size={3} />
            <span class="xp">
              <PixelText text="+1 XP" size={3} />
            </span>
          </p>
          <p class="meta">
            Remix 3로 만든 사이트 ·{' '}
            <a href={profile.source}>소스 보기</a>
          </p>
        </footer>
      </div>
    )
  }
}

const shellStyle = css({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
})

const headerStyle = css({
  width: 'var(--page)',
  marginInline: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  paddingBlock: '20px',
})

const logoStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  color: 'var(--ink)',
  textDecoration: 'none',
  '& .pixel-icon': { flex: 'none' },
  '&:hover': { color: 'var(--accent)' },
})

const navStyle = css({
  display: 'flex',
  gap: '6px',
  fontFamily: 'var(--font-mono)',
  fontSize: '14px',
  '& a': {
    padding: '6px 10px',
    textDecoration: 'none',
    color: 'var(--muted)',
  },
  '& a:hover': { color: 'var(--ink)', background: 'var(--surface)' },
  '& a[aria-current="page"]': {
    color: 'var(--ink)',
    boxShadow: 'inset 0 -3px 0 var(--ember)',
  },
})

const mainStyle = css({
  flex: 1,
  width: 'var(--page)',
  marginInline: 'auto',
})

const footerStyle = css({
  width: 'var(--page)',
  marginInline: 'auto',
  marginTop: '96px',
  paddingBlock: '40px 48px',
  borderTop: '4px dashed var(--line)',
  textAlign: 'center',
  color: 'var(--muted)',
  '& .thanks': {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '18px',
    margin: 0,
  },
  '& .xp': {
    color: 'var(--ember)',
    animation: 'xp 2.4s ease-out infinite',
  },
  '& .meta': {
    margin: '20px 0 0',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
  },
})
