import type { Handle } from 'remix/component'
import { css } from 'remix/component'

import { releaseHref, type Project } from '../../data/projects.ts'
import { routes } from '../../routes.ts'
import { pixelFrame } from '../../ui/frame.ts'
import { StatusTag } from '../../ui/item-card.tsx'
import { PixelIcon, PixelText } from '../../ui/pixel.tsx'
import { SiteLayout } from '../../ui/site-layout.tsx'
import { Document } from '../document.tsx'

export function ProjectPage(handle: Handle<{ project: Project; previous: Project; next: Project }>) {
  return () => {
    let { project, previous, next } = handle.props
    let release = releaseHref(project)

    return (
      <Document title={project.name} description={`${project.tagline} — ${project.summary}`}>
        <SiteLayout current="projects">
          <nav aria-label="현재 위치" mix={crumbStyle}>
            <a href={routes.projects.index.href()}>인벤토리</a>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{project.slug}</span>
          </nav>

          <article mix={articleStyle} data-status={project.status}>
            <header class="head">
              <div class="slot">
                <PixelIcon name={project.icon} size={8} />
              </div>
              <div class="title">
                <h1>
                  <span class="sr-only">{project.name}</span>
                  <PixelText text={project.name} size={5} />
                </h1>
                <p class="meta">
                  <StatusTag status={project.status} />
                  {project.release ? <span class="release">{project.release}</span> : null}
                </p>
                <p class="tagline">{project.tagline}</p>
                <p class="summary" lang="en">
                  {project.summary}
                </p>
              </div>
            </header>

            <div class="columns">
              <section aria-labelledby="about-heading">
                <h2 id="about-heading">소개</h2>
                {project.description.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                <h2>특징</h2>
                <ul class="highlights">
                  {project.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <aside aria-label="프로젝트 정보">
                <h2>장비</h2>
                <ul class="stack">
                  {project.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div class="links">
                  <a href={project.repo} class="button primary">
                    저장소 보기
                  </a>
                  {release ? (
                    <a href={release} class="button">
                      {project.release} 릴리스
                    </a>
                  ) : null}
                </div>
                {project.status === 'archived' ? (
                  <p class="note">보관된 저장소라 읽기 전용입니다. 코드와 릴리스는 그대로 볼 수 있어요.</p>
                ) : null}
              </aside>
            </div>
          </article>

          <nav aria-label="다른 프로젝트" mix={pagerStyle}>
            <a href={routes.projects.show.href({ slug: previous.slug })} rel="prev">
              <span class="dir">← 이전</span>
              <span class="name">{previous.name}</span>
            </a>
            <a href={routes.projects.show.href({ slug: next.slug })} rel="next">
              <span class="dir">다음 →</span>
              <span class="name">{next.name}</span>
            </a>
          </nav>
        </SiteLayout>
      </Document>
    )
  }
}

const crumbStyle = css({
  padding: '28px 0 0',
  fontFamily: 'var(--font-mono)',
  fontSize: '14px',
  color: 'var(--muted)',
  '& a': { color: 'var(--accent)' },
})

const articleStyle = css({
  marginTop: '24px',
  '& .head': {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: '32px',
    alignItems: 'center',
    margin: '4px',
    padding: '28px',
    background: 'var(--coal)',
    color: '#f1ebe6',
    ...pixelFrame('#5a5155', 4, 'var(--shadow)'),
  },
  '&[data-status="active"] .head': pixelFrame('var(--ember)', 4, 'var(--shadow)'),
  '& .slot': {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    width: '160px',
    height: '160px',
    overflow: 'hidden',
    background: 'var(--slot)',
    boxShadow: 'inset 6px 6px 0 #0d0a0b, inset -6px -6px 0 #3d3438',
  },
  '&[data-status="archived"] .slot .pixel-icon': { filter: 'saturate(0.2)', opacity: 0.8 },
  '&[data-status="active"] .slot::after': {
    content: '""',
    position: 'absolute',
    inset: '-20px auto -20px 0',
    width: '30px',
    background: 'rgb(255 255 255 / 0.3)',
    animation: 'glint 4.5s ease-in-out infinite',
  },
  '& h1': { margin: 0, color: '#f1ebe6' },
  '&[data-status="active"] h1': { color: '#ff9a63' },
  '& .meta': { display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0 0' },
  '& .release': { fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#a39a9e' },
  '& .tagline': { margin: '14px 0 0', fontSize: '20px', fontWeight: 700 },
  '& .summary': { margin: '4px 0 0', color: '#a39a9e' },
  '& .columns': {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 300px',
    gap: '48px',
    marginTop: '48px',
  },
  '& h2': {
    margin: '0 0 12px',
    fontSize: '20px',
    paddingLeft: '12px',
    boxShadow: 'inset 5px 0 0 var(--ember)',
  },
  '& section p': { margin: '0 0 14px', maxWidth: '42rem' },
  '& section h2:not(:first-child)': { marginTop: '36px' },
  '& .highlights': { margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '10px' },
  '& .highlights li': { position: 'relative', paddingLeft: '22px' },
  '& .highlights li::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '0.6em',
    width: '8px',
    height: '8px',
    background: 'var(--ember)',
  },
  '& .stack': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    margin: '0 0 28px',
    padding: 0,
    listStyle: 'none',
  },
  '& .stack li': {
    margin: '3px',
    padding: '4px 10px',
    background: 'var(--surface)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13.5px',
    ...pixelFrame('var(--line)', 3),
  },
  '& .links': { display: 'flex', flexWrap: 'wrap', gap: '16px' },
  '& .button': {
    display: 'inline-block',
    margin: '4px',
    padding: '10px 16px',
    background: 'var(--surface)',
    color: 'var(--ink)',
    fontWeight: 700,
    textDecoration: 'none',
    ...pixelFrame('var(--line)', 4),
  },
  '& .button.primary': {
    background: 'var(--ember)',
    color: 'var(--coal)',
    ...pixelFrame('var(--coal)', 4),
  },
  '& .button:hover': { transform: 'translate(-2px, -2px)' },
  '& .note': { marginTop: '24px', fontSize: '14px', color: 'var(--muted)' },
  '@media (max-width: 820px)': {
    '& .columns': { gridTemplateColumns: '1fr', gap: '40px' },
  },
  '@media (max-width: 560px)': {
    '& .head': { gridTemplateColumns: '1fr', padding: '20px', gap: '20px' },
    '& .slot': { width: '112px', height: '112px' },
    '& .slot .pixel-icon': { width: '88px' },
  },
})

const pagerStyle = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginTop: '64px',
  '& a': {
    display: 'grid',
    gap: '2px',
    margin: '4px',
    padding: '14px 18px',
    background: 'var(--surface)',
    textDecoration: 'none',
    ...pixelFrame('var(--line)', 4),
  },
  '& a[rel="next"]': { textAlign: 'right' },
  '& a:hover': { transform: 'translate(-2px, -2px)' },
  '& .dir': { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' },
  '& .name': { fontWeight: 700 },
})
