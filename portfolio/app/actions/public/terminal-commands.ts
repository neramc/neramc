// Pure command interpreter for the home-page terminal. It runs in the browser
// (hydrated terminal) and on the server (the no-JavaScript form submission),
// so it must not touch the DOM, the network, or any server-only module.

export type Tone = 'out' | 'muted' | 'accent' | 'ok' | 'error'

export interface Line {
  text: string
  tone?: Tone
}

export interface Entry {
  cmd?: string
  lines: Line[]
}

export interface TerminalProject {
  slug: string
  name: string
  status: 'active' | 'archived'
  href: string
}

export interface TerminalData {
  projects: TerminalProject[]
  gear: { label: string; items: string[] }[]
  githubHref: string
}

export interface CommandResult {
  lines: Line[]
  /** Same-origin path or absolute URL to open after printing. */
  navigate?: string
  clear?: boolean
  xp?: number
}

export const MAX_INPUT = 64

const MOTTO = '빠르게, 안전하게, 그다음에 예쁘게.'

const HELP: [string, string][] = [
  ['help', '이 목록'],
  ['whoami', '누가 만들었나'],
  ['ls', '프로젝트 목록'],
  ['open <이름>', '프로젝트 페이지 열기'],
  ['stack', '쓰는 언어와 도구'],
  ['cat ~/.motto', '좌우명'],
  ['mine', '곡괭이 휘두르기'],
  ['github', 'GitHub 프로필로 이동'],
  ['date', '지금 시각 (KST)'],
  ['clear', '화면 지우기'],
]

const ORES: { name: string; weight: number; xp: number; tone: Tone }[] = [
  { name: '돌', weight: 50, xp: 1, tone: 'out' },
  { name: '구리 광석', weight: 25, xp: 2, tone: 'accent' },
  { name: '철 광석', weight: 15, xp: 3, tone: 'out' },
  { name: '금 광석', weight: 8, xp: 5, tone: 'accent' },
  { name: '불씨 광석', weight: 2, xp: 10, tone: 'ok' },
]

export function introEntries(): Entry[] {
  return [
    { lines: [{ text: '어서 오세요! 명령어를 입력해 보세요. 처음이라면 help', tone: 'muted' }] },
    { cmd: 'whoami', lines: whoami() },
  ]
}

export function runCommand(
  input: string,
  data: TerminalData,
  options: { random?: () => number; now?: Date } = {},
): CommandResult {
  let line = input.trim().slice(0, MAX_INPUT)
  if (line === '') return { lines: [] }

  let [name, ...args] = line.split(/\s+/)
  let arg = args.join(' ')

  switch (name.toLowerCase()) {
    case 'help':
    case '?':
      return {
        lines: [
          ...HELP.map(([cmd, desc]) => ({ text: `${cmd.padEnd(14)}${desc}` })),
          { text: '↑ ↓ 키로 이전 명령어를 다시 불러올 수 있어요.', tone: 'muted' },
        ],
      }
    case 'whoami':
      return { lines: whoami() }
    case 'ls':
    case 'dir':
      return { lines: list(data.projects) }
    case 'open':
    case 'cd':
      return open(arg, data)
    case 'stack':
      return {
        lines: data.gear.map((group) => ({ text: `${group.label.padEnd(6)} ${group.items.join(', ')}` })),
      }
    case 'cat':
      if (/^(~\/)?\.?motto$/.test(arg)) return { lines: [{ text: MOTTO, tone: 'accent' }] }
      return { lines: [{ text: `cat: ${arg || '(없음)'}: 그런 파일이 없습니다`, tone: 'error' }] }
    case 'mine':
      return mine(options.random ?? Math.random)
    case 'github':
      return { lines: [{ text: 'GitHub 프로필로 이동합니다…', tone: 'muted' }], navigate: data.githubHref }
    case 'date':
      return { lines: [{ text: `${formatDate(options.now ?? new Date())} (KST)` }] }
    case 'echo':
      return { lines: [{ text: arg }] }
    case 'clear':
    case 'cls':
      return { lines: [], clear: true }
    case 'sudo':
      return {
        lines: [
          { text: 'neramc is not in the sudoers file. This incident will be reported.', tone: 'error' },
          { text: '(농담이에요)', tone: 'muted' },
        ],
      }
    case 'rm':
      return {
        lines: [
          /^-\w+\s+\/\*?$/.test(arg)
            ? { text: '그건 안 돼요. App Deleter도 시스템 폴더는 지우지 않습니다.', tone: 'error' }
            : { text: 'rm: 이 터미널은 읽기 전용입니다.', tone: 'error' },
        ],
      }
    case 'exit':
    case 'logout':
    case 'quit':
      return { lines: [{ text: '로그아웃할 곳이 없어요. 조금 더 둘러보세요!', tone: 'muted' }] }
    default:
      return {
        lines: [
          { text: `${name}: command not found`, tone: 'error' },
          { text: 'help 를 입력하면 명령어 목록이 나와요.', tone: 'muted' },
        ],
      }
  }
}

function whoami(): Line[] {
  return [
    { text: 'neramc', tone: 'accent' },
    { text: '웹과 데스크톱 앱을 만듭니다. · I build web apps and native desktop tools.' },
  ]
}

function list(projects: TerminalProject[]): Line[] {
  let names = (status: TerminalProject['status']) =>
    projects
      .filter((project) => project.status === status)
      .map((project) => `${project.slug}/`)
      .join('  ')
  return [
    { text: `장착 중   ${names('active')}`, tone: 'accent' },
    { text: `보관함    ${names('archived')}` },
    { text: 'open <이름> 으로 열어 보세요.', tone: 'muted' },
  ]
}

function open(arg: string, data: TerminalData): CommandResult {
  let wanted = normalize(arg)
  if (wanted === '') {
    return { lines: [{ text: '사용법: open <이름>   예) open linuxhub', tone: 'muted' }] }
  }
  if (wanted === 'github') {
    return { lines: [{ text: 'GitHub 프로필로 이동합니다…', tone: 'muted' }], navigate: data.githubHref }
  }
  let project = data.projects.find(
    (candidate) =>
      normalize(candidate.slug) === wanted ||
      normalize(candidate.name) === wanted ||
      normalize(candidate.slug).startsWith(wanted),
  )
  if (!project) {
    return {
      lines: [
        { text: `open: ${arg}: 그런 프로젝트가 없습니다`, tone: 'error' },
        { text: 'ls 로 목록을 볼 수 있어요.', tone: 'muted' },
      ],
    }
  }
  return { lines: [{ text: `${project.name} 여는 중…`, tone: 'ok' }], navigate: project.href }
}

function mine(random: () => number): CommandResult {
  let total = ORES.reduce((sum, ore) => sum + ore.weight, 0)
  let roll = random() * total
  let ore = ORES[ORES.length - 1]
  for (let candidate of ORES) {
    if (roll < candidate.weight) {
      ore = candidate
      break
    }
    roll -= candidate.weight
  }
  return {
    lines: [
      { text: '곡괭이를 휘둘렀다… 탕! 탕! 탕!', tone: 'muted' },
      { text: `${ore.name}을 캤다! +${ore.xp} XP`, tone: ore.tone },
    ],
    xp: ore.xp,
  }
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/^~?\/?(projects\/)?/, '').replace(/\/+$/, '').replace(/\s+/g, '-')
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(date)
}
