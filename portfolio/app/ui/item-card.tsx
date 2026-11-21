import type { Handle } from 'remix/component'
import { css } from 'remix/component'

import type { Project } from '../data/projects.ts'
import { routes } from '../routes.ts'
import { pixelFrame } from './frame.ts'
import { PixelIcon, PixelText } from './pixel.tsx'

/** A project drawn as an inventory item; the whole card links to its page. */
export function ItemCard(handle: Handle<{ project: Project }>) {
  return () => {
    let { project } = handle.props
    return (
      <a
        href={routes.projects.show.href({ slug: project.slug })}
        mix={cardStyle}
        data-status={project.status}
      >
        <div class="slot">
          <PixelIcon name={project.icon} size={4} />
        </div>
        <div class="body">
          <h3 class="name">
            <span class="sr-only">{project.name}</span>
            <PixelText text={project.name} size={2.5} />
          </h3>
          <span class="meta">
            <StatusTag status={project.status} />
            {project.release ? <span class="release">{project.release}</span> : null}
          </span>
          <span class="tagline">{project.tagline}</span>
          <span class="stack">{project.stack.slice(0, 3).join(' · ')}</span>
        </div>
      </a>
    )
  }
}

export function StatusTag(handle: Handle<{ status: Project['status'] }>) {
  return () => {
    let active = handle.props.status === 'active'
    return (
      <span mix={tagStyle} data-status={handle.props.status}>
        <span class="sr-only">{active ? '진행 중' : '보관됨'}</span>
        <PixelText text={active ? 'ACTIVE' : 'ARCHIVED'} size={1.5} />
      </span>
    )
  }
}

const cardStyle = css({
  '--frame': '#5a5155',
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  gap: '18px',
  alignItems: 'center',
  margin: '4px',
  padding: '16px',
  background: 'var(--coal)',
  color: '#f1ebe6',
  textDecoration: 'none',
  ...pixelFrame('var(--frame)', 4),
  transition: 'transform 120ms steps(2), box-shadow 120ms steps(2)',
  '&[data-status="active"]': { '--frame': 'var(--ember)' },
  '&:hover, &:focus-visible': {
    transform: 'translate(-3px, -3px)',
    ...pixelFrame('var(--frame)', 4, 'var(--shadow)'),
  },
  '&:active': { transform: 'translate(0, 0)' },
  '& .slot': {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    width: '88px',
    height: '88px',
    overflow: 'hidden',
    background: 'var(--slot)',
    boxShadow: 'inset 4px 4px 0 #0d0a0b, inset -4px -4px 0 #3d3438',
  },
  '&[data-status="archived"] .slot .pixel-icon': { filter: 'saturate(0.2)', opacity: 0.8 },
  '&[data-status="active"] .slot::after': {
    content: '""',
    position: 'absolute',
    inset: '-10px auto -10px 0',
    width: '18px',
    background: 'rgb(255 255 255 / 0.35)',
    animation: 'glint 4.5s ease-in-out infinite',
  },
  '& .body': { display: 'grid', gap: '6px', minWidth: 0 },
  '& .name': { margin: 0, color: '#f1ebe6' },
  '&[data-status="active"] .name': { color: '#ff9a63' },
  '& .meta': { display: 'flex', alignItems: 'center', gap: '10px' },
  '& .release': { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#a39a9e' },
  '& .tagline': { fontSize: '15px', lineHeight: 1.45 },
  '& .stack': { fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: '#8a8186' },
  '@media (max-width: 420px)': {
    gridTemplateColumns: '1fr',
    '& .slot': { width: '72px', height: '72px' },
    '& .slot .pixel-icon': { width: '56px' },
  },
})

const tagStyle = css({
  display: 'inline-flex',
  padding: '3px 6px',
  background: '#4a4044',
  color: '#d8d1cc',
  '&[data-status="active"]': { background: 'var(--ember)', color: 'var(--coal)' },
})
