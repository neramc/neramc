import { clientEntry, css, navigate, on, ref, type Handle } from 'remix/component'

import {
  MAX_INPUT,
  runCommand,
  type Entry,
  type TerminalData,
  type Tone,
} from './terminal-commands.ts'

const XP_KEY = 'neramc:xp'
const MAX_ENTRIES = 60

// The entry id is a public URL: Vite's client build maps `/assets/app/...` back
// to the bundled chunk for this module (see `app/entry.client.ts`).
const TERMINAL_ENTRY = '/assets/app/actions/public/terminal.tsx#Terminal'

interface TerminalProps {
  data: TerminalData
  history: Entry[]
  /** Where the no-JavaScript form submits. */
  action: string
}

// Server-rendered as a plain GET form; once hydrated, commands run in the
// browser and only `open`/`github` leave the page.
export const Terminal = clientEntry(TERMINAL_ENTRY, function Terminal(handle: Handle<TerminalProps>) {
  let history = handle.props.history
  let recalled: string[] = []
  let recallIndex = -1
  let xp = 0
  let input: HTMLInputElement | undefined
  let screen: HTMLElement | undefined

  handle.queueTask(() => {
    xp = readXp()
    if (xp > 0) handle.update()
  })

  async function submit(event: Event) {
    event.preventDefault()
    if (!input) return
    let value = input.value.slice(0, MAX_INPUT)
    input.value = ''
    recallIndex = -1
    if (value.trim()) recalled.unshift(value)

    let result = runCommand(value, handle.props.data)
    history = result.clear ? [] : [...history, { cmd: value, lines: result.lines }].slice(-MAX_ENTRIES)
    if (result.xp) {
      xp += result.xp
      writeXp(xp)
    }
    await handle.update()
    screen?.scrollTo({ top: screen.scrollHeight })

    if (result.navigate) {
      if (result.navigate.startsWith('/')) await navigate(result.navigate)
      else window.location.assign(result.navigate)
    }
  }

  function recall(event: KeyboardEvent) {
    if (!input || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
    event.preventDefault()
    recallIndex =
      event.key === 'ArrowUp'
        ? Math.min(recallIndex + 1, recalled.length - 1)
        : Math.max(recallIndex - 1, -1)
    input.value = recallIndex === -1 ? '' : recalled[recallIndex]
  }

  return () => (
    <section id="terminal" mix={terminalStyle} aria-label="인터랙티브 터미널">
      <div class="bar">
        <span class="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span class="title">neramc@portfolio: ~</span>
        <span class="xp" aria-live="polite">
          {xp > 0 ? `XP ${xp}` : ''}
        </span>
      </div>
      <div
        class="screen"
        mix={[
          ref((node) => (screen = node)),
          on('click', () => {
            if (!window.getSelection()?.toString()) input?.focus()
          }),
        ]}
      >
        <ol class="log" aria-live="polite">
          {history.map((entry, index) => (
            <li key={index}>
              {entry.cmd !== undefined ? (
                <p class="cmd">
                  <span class="prompt" aria-hidden="true">
                    $
                  </span>{' '}
                  {entry.cmd}
                </p>
              ) : null}
              {entry.lines.map((line, lineIndex) => (
                <p key={lineIndex} data-tone={line.tone ?? 'out'}>
                  {line.text}
                </p>
              ))}
            </li>
          ))}
        </ol>
        <form method="get" action={handle.props.action} class="input" mix={on('submit', (event) => submit(event))}>
          <label for={handle.id} class="sr-only">
            명령어 입력
          </label>
          <span class="prompt" aria-hidden="true">
            $
          </span>
          <input
            id={handle.id}
            name="cmd"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck={false}
            maxLength={MAX_INPUT}
            placeholder="help"
            mix={[ref((node) => (input = node)), on('keydown', (event) => recall(event))]}
          />
        </form>
      </div>
    </section>
  )
})

function readXp() {
  try {
    let value = Number.parseInt(localStorage.getItem(XP_KEY) ?? '0', 10)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function writeXp(value: number) {
  try {
    localStorage.setItem(XP_KEY, String(value))
  } catch {
    // Storage can be unavailable (private mode); XP just won't persist.
  }
}

const tones: Record<Tone, string> = {
  out: '#d8d1cc',
  muted: '#8a8186',
  accent: '#ff9a63',
  ok: '#9fd18b',
  error: '#ff7b72',
}

const terminalStyle = css({
  background: '#141012',
  color: tones.out,
  fontFamily: 'var(--font-mono)',
  fontSize: '15px',
  lineHeight: 1.6,
  margin: '4px',
  boxShadow:
    '0 -4px 0 0 #3b3337, 0 4px 0 0 #3b3337, -4px 0 0 0 #3b3337, 4px 0 0 0 #3b3337, 12px 12px 0 0 var(--shadow)',
  '& .bar': {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    padding: '8px 14px',
    background: '#2e2629',
    color: '#a39a9e',
    fontSize: '13px',
  },
  '& .dots': { display: 'flex', gap: '8px' },
  '& .dots i': { width: '12px', height: '12px', background: '#5a5155' },
  '& .dots i:first-child': { background: 'var(--ember)' },
  '& .dots i:nth-child(2)': { background: '#8a8186' },
  '& .xp': { justifySelf: 'end', color: 'var(--amber)' },
  '& .screen': {
    height: '340px',
    overflowY: 'auto',
    padding: '16px 18px 12px',
    cursor: 'text',
  },
  '& .log': { listStyle: 'none', margin: 0, padding: 0 },
  '& .log li': { marginBottom: '10px', animation: 'line-in 160ms steps(2)' },
  '& p': { margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
  '& .cmd': { color: '#f1ebe6' },
  '& .prompt': { color: 'var(--ember)' },
  '& [data-tone="muted"]': { color: tones.muted },
  '& [data-tone="accent"]': { color: tones.accent },
  '& [data-tone="ok"]': { color: tones.ok },
  '& [data-tone="error"]': { color: tones.error },
  '& .input': { display: 'flex', gap: '10px', alignItems: 'center' },
  '& input': {
    flex: 1,
    minWidth: 0,
    padding: 0,
    border: 0,
    background: 'transparent',
    color: '#f1ebe6',
    font: 'inherit',
    caretColor: 'var(--ember)',
    outline: 'none',
  },
  '& input::placeholder': { color: '#5a5155' },
  '& input:focus-visible': { outline: 'none' },
  '&:focus-within': {
    boxShadow:
      '0 -4px 0 0 var(--ember), 0 4px 0 0 var(--ember), -4px 0 0 0 var(--ember), 4px 0 0 0 var(--ember), 12px 12px 0 0 var(--shadow)',
  },
  '@media (max-width: 560px)': {
    fontSize: '13.5px',
    '& .screen': { height: '300px', padding: '12px' },
    '& .title': { display: 'none' },
  },
})
