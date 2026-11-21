import { css } from 'remix/component'
import type { RenderFunction } from 'remix/middleware/render'

import { routes } from '../routes.ts'
import { pixelFrame } from '../ui/frame.ts'
import { PixelIcon, PixelText } from '../ui/pixel.tsx'
import { SiteLayout } from '../ui/site-layout.tsx'
import { Document } from './document.tsx'

/** The 404 response for unmatched URLs and unknown project slugs. */
export function notFound(context: { render: RenderFunction }) {
  return context.render(<NotFoundPage />, { status: 404 })
}

export function NotFoundPage() {
  return () => (
    <Document title="404">
      <SiteLayout>
        <section mix={style}>
          <PixelIcon name="pickaxe" size={6} />
          <h1>
            <span class="sr-only">404</span>
            <PixelText text="404" size={14} />
          </h1>
          <p class="lead">이 광석은 아직 캐지 않았어요.</p>
          <p class="sub">The page you’re looking for doesn’t exist.</p>
          <a href={routes.home.href()}>처음으로 돌아가기</a>
        </section>
      </SiteLayout>
    </Document>
  )
}

const style = css({
  display: 'grid',
  justifyItems: 'center',
  gap: '12px',
  padding: '72px 0',
  textAlign: 'center',
  '& h1': { margin: '12px 0 0', color: 'var(--ink)' },
  '& .lead': { margin: '16px 0 0', fontSize: '22px', fontWeight: 700 },
  '& .sub': { margin: 0, color: 'var(--muted)' },
  '& a': {
    marginTop: '24px',
    padding: '10px 18px',
    background: 'var(--ember)',
    color: 'var(--coal)',
    fontWeight: 700,
    textDecoration: 'none',
    ...pixelFrame('var(--coal)', 4),
  },
})
