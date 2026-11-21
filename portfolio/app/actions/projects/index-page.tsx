import type { Handle } from 'remix/component'
import { css } from 'remix/component'

import { projects, type Project } from '../../data/projects.ts'
import { ItemCard } from '../../ui/item-card.tsx'
import { SiteLayout } from '../../ui/site-layout.tsx'
import { Document } from '../document.tsx'

const groups: { status: Project['status']; title: string; sub: string }[] = [
  { status: 'active', title: '장착 중', sub: 'Active · 지금 손보고 있는 것' },
  { status: 'archived', title: '보관함', sub: 'Archived · 읽기 전용으로 보관한 것' },
]

export function ProjectsIndexPage() {
  return () => (
    <Document title="인벤토리" description="neramc가 만든 프로젝트 목록">
      <SiteLayout current="projects">
        <header mix={introStyle}>
          <h1>인벤토리</h1>
          <p>
            공개 저장소에 있는 프로젝트 {projects.length}개입니다. 카드를 누르면 자세한 설명과 저장소
            링크를 볼 수 있어요.
          </p>
        </header>
        {groups.map((group) => (
          <Group key={group.status} {...group} />
        ))}
      </SiteLayout>
    </Document>
  )
}

function Group(handle: Handle<{ status: Project['status']; title: string; sub: string }>) {
  return () => {
    let { status, title, sub } = handle.props
    let items = projects.filter((project) => project.status === status)
    return (
      <section mix={groupStyle} aria-labelledby={`group-${status}`}>
        <h2 id={`group-${status}`}>
          {title} <span>{sub}</span>
        </h2>
        <div class="grid">
          {items.map((project) => (
            <ItemCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    )
  }
}

const introStyle = css({
  padding: '40px 0 8px',
  '& h1': { margin: 0, fontSize: 'clamp(30px, 5vw, 40px)' },
  '& p': { margin: '10px 0 0', color: 'var(--muted)', maxWidth: '36rem' },
})

const groupStyle = css({
  marginTop: '48px',
  '& h2': {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: '4px 12px',
    margin: '0 0 22px',
    paddingLeft: '14px',
    fontSize: '24px',
    boxShadow: 'inset 6px 0 0 var(--ember)',
  },
  '& h2 span': { fontSize: '14px', fontWeight: 400, color: 'var(--muted)' },
  '& .grid': {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 440px), 1fr))',
    gap: '20px',
  },
})
