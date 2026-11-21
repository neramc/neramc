import type { Handle } from 'remix/component'
import { css } from 'remix/component'

import { gear, profile, projects } from '../data/projects.ts'
import { routes } from '../routes.ts'
import { pixelFrame } from '../ui/frame.ts'
import { ItemCard } from '../ui/item-card.tsx'
import { PixelIcon, PixelText } from '../ui/pixel.tsx'
import { SiteLayout } from '../ui/site-layout.tsx'
import { Document } from './document.tsx'
import { Terminal } from './public/terminal.tsx'
import type { Entry, TerminalData } from './public/terminal-commands.ts'

export interface HomePageProps {
  terminal: { data: TerminalData; history: Entry[]; action: string }
}

export function HomePage(handle: Handle<HomePageProps>) {
  return () => (
    <Document>
      <SiteLayout current="home">
        <Hero />

        <section mix={sectionStyle} aria-labelledby="terminal-heading">
          <SectionHeading id="terminal-heading" title="터미널" sub="명령어를 입력해 보세요 · try “help”" />
          <Terminal {...handle.props.terminal} />
        </section>

        <section mix={sectionStyle} aria-labelledby="inventory-heading">
          <SectionHeading
            id="inventory-heading"
            title="인벤토리"
            sub="만든 것들 · 카드를 누르면 자세히 볼 수 있어요"
          />
          <div mix={gridStyle}>
            {projects.map((project) => (
              <ItemCard key={project.slug} project={project} />
            ))}
          </div>
        </section>

        <section mix={sectionStyle} aria-labelledby="gear-heading">
          <SectionHeading id="gear-heading" title="장비" sub="Tech stack" />
          <dl mix={gearStyle}>
            {gear.map((group) => (
              <div key={group.label}>
                <dt>{group.label}</dt>
                <dd>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </SiteLayout>
    </Document>
  )
}

// Deterministic ember layout so server output is stable.
const embers = Array.from({ length: 16 }, (_, i) => {
  let seed = (i * 7919) % 101
  return {
    left: (i * 37 + seed) % 100,
    size: [4, 6, 6, 8][i % 4],
    rise: 120 + ((seed * 3) % 110),
    drift: ((seed % 9) - 4) * 8,
    duration: 3.8 + ((seed * 13) % 37) / 10,
    delay: -((seed * 17) % 60) / 10,
    color: ['var(--ember)', 'var(--ember)', 'var(--amber)', 'var(--glow)'][(i + seed) % 4],
  }
})

function Hero() {
  return () => (
    <section mix={heroStyle} aria-labelledby="hero-heading">
      <div class="embers" aria-hidden="true">
        {embers.map((ember, i) => (
          <i
            key={i}
            style={{
              left: `${ember.left}%`,
              width: ember.size,
              height: ember.size,
              background: ember.color,
              '--rise': `${ember.rise}px`,
              '--drift': `${ember.drift}px`,
              animationDuration: `${ember.duration}s`,
              animationDelay: `${ember.delay}s`,
            }}
          />
        ))}
      </div>

      <div class="copy">
        <p class="eyebrow">~/neramc $ cat README</p>
        <h1 id="hero-heading" class="wordmark">
          <span class="sr-only">neramc</span>
          <span class="pick" aria-hidden="true">
            <PixelIcon name="pickaxe" size={5} />
            <span class="spark" style={{ '--dx': '-28px', '--dy': '-26px' }} />
            <span class="spark" style={{ '--dx': '-12px', '--dy': '-40px' }} />
            <span class="spark" style={{ '--dx': '-34px', '--dy': '8px' }} />
          </span>
          <span class="letters">
            <PixelText text="NERAMC" size={10} />
          </span>
          <span class="cursor" aria-hidden="true" />
        </h1>
        <p class="lead">웹과 데스크톱 앱을 만듭니다.</p>
        <p class="sub">I build web apps and native desktop tools.</p>
        <p class="motto">“빠르게, 안전하게, 그다음에 예쁘게.”</p>
        <div class="actions">
          <a href={routes.projects.index.href()} class="button primary">
            인벤토리 열기
          </a>
          <a href={profile.github} class="button" rel="me">
            GitHub
          </a>
        </div>
      </div>

      <figure class="avatar">
        <div class="frame">
          <img src={profile.avatar} width="160" height="160" alt="neramc 프로필 사진" />
        </div>
        <figcaption>@{profile.handle}</figcaption>
      </figure>
    </section>
  )
}

function SectionHeading(handle: Handle<{ id: string; title: string; sub: string }>) {
  return () => (
    <header mix={headingStyle}>
      <h2 id={handle.props.id}>{handle.props.title}</h2>
      <p>{handle.props.sub}</p>
    </header>
  )
}

const heroStyle = css({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '40px',
  padding: '56px 0 72px',
  '& .embers': { position: 'absolute', inset: '0 -16px', overflow: 'hidden', pointerEvents: 'none' },
  '& .embers i': {
    position: 'absolute',
    bottom: '8px',
    opacity: 0,
    animation: 'rise linear infinite',
  },
  '& .copy': { position: 'relative', minWidth: 0 },
  '& .eyebrow': {
    margin: '0 0 18px',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--muted)',
  },
  '& .wordmark': {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '14px',
    margin: 0,
    color: 'var(--ink)',
  },
  '& .letters': {
    flex: '0 1 auto',
    minWidth: 0,
    filter: 'drop-shadow(5px 5px 0 var(--shadow))',
  },
  '@media (prefers-color-scheme: dark)': {
    '& .letters': { filter: 'drop-shadow(5px 5px 0 rgb(255 122 61 / 0.45))' },
  },
  '& .pick': {
    position: 'relative',
    flex: 'none',
    width: '64px',
    transformOrigin: '12px 68px',
    animation: 'swing 1.8s ease-in-out infinite',
  },
  '& .spark': {
    position: 'absolute',
    right: '-10px',
    top: '24px',
    width: '6px',
    height: '6px',
    background: 'var(--glow)',
    opacity: 0,
    animation: 'spark 1.8s ease-out infinite',
  },
  '& .cursor': {
    flex: 'none',
    width: '40px',
    height: '10px',
    marginBottom: '2px',
    background: 'var(--ember)',
    animation: 'blink 1.1s steps(1) infinite',
  },
  '& .lead': { margin: '28px 0 0', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700 },
  '& .sub': { margin: '2px 0 0', color: 'var(--muted)' },
  '& .motto': { margin: '18px 0 0', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent)' },
  '& .actions': { display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '32px' },
  '& .button': {
    display: 'inline-block',
    margin: '4px',
    padding: '10px 18px',
    background: 'var(--surface)',
    color: 'var(--ink)',
    fontWeight: 700,
    textDecoration: 'none',
    ...pixelFrame('var(--line)', 4),
    transition: 'transform 100ms steps(2)',
  },
  '& .button.primary': {
    background: 'var(--ember)',
    color: 'var(--coal)',
    ...pixelFrame('var(--coal)', 4),
  },
  '& .button:hover': { transform: 'translate(-2px, -2px)' },
  '& .button:active': { transform: 'translate(1px, 1px)' },
  '& .avatar': { position: 'relative', margin: 0, textAlign: 'center' },
  '& .avatar .frame': {
    display: 'inline-block',
    margin: '4px',
    padding: '10px',
    background: 'var(--slot)',
    ...pixelFrame('var(--line)', 4, 'var(--shadow)'),
  },
  '& .avatar img': { display: 'block', width: '160px', height: '160px', imageRendering: 'pixelated' },
  '& figcaption': {
    marginTop: '16px',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--muted)',
  },
  '@media (max-width: 720px)': {
    gridTemplateColumns: '1fr',
    padding: '24px 0 48px',
    '& .avatar': { order: -1, textAlign: 'left' },
    '& .avatar img': { width: '112px', height: '112px' },
    '& .pick': { width: '40px', transformOrigin: '8px 42px' },
    '& .cursor': { width: '24px', height: '6px' },
  },
})

const sectionStyle = css({ marginTop: '72px' })

const headingStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: '6px 14px',
  marginBottom: '24px',
  '& h2': {
    margin: 0,
    fontSize: '26px',
    paddingLeft: '14px',
    boxShadow: 'inset 6px 0 0 var(--ember)',
  },
  '& p': { margin: 0, color: 'var(--muted)', fontSize: '14px' },
})

const gridStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 440px), 1fr))',
  gap: '20px',
})

const gearStyle = css({
  display: 'grid',
  gap: '14px',
  margin: 0,
  '& > div': {
    display: 'grid',
    gridTemplateColumns: '96px 1fr',
    alignItems: 'start',
    gap: '12px',
  },
  '& dt': { fontWeight: 700, paddingTop: '6px' },
  '& dd': { margin: 0 },
  '& ul': { display: 'flex', flexWrap: 'wrap', gap: '12px', margin: 0, padding: 0, listStyle: 'none' },
  '& li': {
    margin: '3px',
    padding: '4px 10px',
    background: 'var(--surface)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13.5px',
    ...pixelFrame('var(--line)', 3),
  },
  '@media (max-width: 560px)': {
    '& > div': { gridTemplateColumns: '1fr', gap: '6px' },
  },
})
