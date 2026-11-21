import type { IconName } from '../ui/pixel-art.ts'

export type ProjectStatus = 'active' | 'archived'

export interface Project {
  slug: string
  name: string
  icon: IconName
  status: ProjectStatus
  /** One line, Korean. Shown on cards. */
  tagline: string
  /** One line, English. */
  summary: string
  /** Paragraphs, Korean. */
  description: string[]
  highlights: string[]
  stack: string[]
  repo: string
  release?: string
}

const GITHUB = 'https://github.com/neramc'

// Facts here come from each repository's README. Keep them that way.
export const projects: Project[] = [
  {
    slug: 'linuxhub',
    name: 'Linuxhub',
    icon: 'penguin',
    status: 'active',
    tagline: '리눅스 배포판 50여 개, 설치까지 한곳에',
    summary: 'A fast catalog of Linux distributions with official downloads and install guides.',
    description: [
      '리눅스 배포판을 둘러보고, 공식 미러에서 내려받고, 설치까지 따라 할 수 있는 카탈로그 사이트입니다.',
      'GNOME libadwaita 느낌의 Astro 정적 사이트로, 한국어와 영어를 모두 지원합니다.',
    ],
    highlights: [
      '인기 배포판 약 50개의 공식 로고, 개요, 단계별 설치 가이드',
      '공식 미러·CDN 다운로드와 접속 위치 기준 가까운 미러 추천',
      'GitHub Actions가 6시간마다 릴리스 데이터를 갱신',
      '리눅스 가이드, 배포판 찾기, 비교, 계보도, 릴리스 소식',
      '린트·타입 검사·단위 테스트·E2E 테스트를 품질 관문으로 사용',
    ],
    stack: ['Astro 7', 'TypeScript', 'Bun', 'Vercel', 'Playwright'],
    repo: `${GITHUB}/linuxhub`,
  },
  {
    slug: 'app-deleter',
    name: 'App Deleter',
    icon: 'trash',
    status: 'active',
    tagline: '찌꺼기까지 지우는 Windows 앱 삭제기',
    summary: 'A single-file Windows 11 uninstaller that also removes what an app leaves behind.',
    description: [
      '앱의 제거 프로그램을 실행한 뒤, 남은 파일·폴더·레지스트리·바로가기·서비스·예약 작업·시작 프로그램·방화벽 규칙까지 찾아 정리하는 Windows 11 전용 도구입니다.',
      '"완벽하게" 지우는 것만큼 엉뚱한 것을 지우지 않는 것을 중요하게 설계했습니다.',
    ],
    highlights: [
      '레지스트리 Uninstall 키와 Microsoft Store 앱까지 목록화, 설치 폴더 실측 크기순 정렬',
      'rayon 병렬 순회와 배치 파일 조회로 폴더 크기를 빠르게 계산',
      'Job Object로 제거 프로그램의 모든 자식 프로세스가 끝날 때까지 추적',
      '시스템 폴더 보호 가드, 신뢰도 표시, .reg 백업, 휴지통 이동, 복원 지점',
      'Windows 11 Fluent 디자인, 라이트/다크 모드, 설치가 필요 없는 단일 실행 파일',
    ],
    stack: ['Rust', 'Slint', 'Win32', 'GitHub Actions'],
    repo: `${GITHUB}/app-deleter`,
    release: 'v2.0.0',
  },
  {
    slug: 'quill',
    name: 'Quill',
    icon: 'quill',
    status: 'archived',
    tagline: 'Rust 엔진으로 도는 마크다운 IDE',
    summary: 'A Markdown IDE with a Rust engine behind a Kotlin desktop UI.',
    description: [
      '마크다운 문서를 개발 환경이 소스 코드를 다루듯 다루는 편집기입니다. 입력하는 동안 파싱하고, 문제를 알려 주고, 결과 페이지를 보여 줍니다.',
      '파싱부터 내보내기까지 전부 Rust 엔진이 맡고, Kotlin UI가 Java FFM API로 그 엔진을 호출합니다.',
    ],
    highlights: [
      '하이라이트·개요·통계·검사·미리보기가 모두 같은 파싱 결과에서 나옴',
      'CommonMark, GFM, MDX, Markdoc, MyST, Pandoc 등 8개 방언',
      '입력할 때마다 도는 14개 검사와 Problems 도구 창',
      'HTML·PDF·Word·EPUB·Confluence·Notion·GitHub README 내보내기',
      'Vim 모드, Focus Mode, 다섯 가지 범위의 프로젝트 검색',
    ],
    stack: ['Rust', 'Kotlin', 'Compose Multiplatform', 'Java FFM', 'C#', 'Gradle'],
    repo: `${GITHUB}/quill`,
    release: 'v1.3.0',
  },
  {
    slug: 'markdown-studio',
    name: 'Markdown Studio',
    icon: 'page',
    status: 'archived',
    tagline: '브라우저 없이 그리는 마크다운 편집기',
    summary: 'A native Markdown editor whose preview is drawn without an embedded browser.',
    description: [
      'C#과 .NET 10, Avalonia로 만든 마크다운 편집기입니다. 미리보기를 내장 브라우저 없이 네이티브 컨트롤로 직접 그립니다.',
      'Electron도 WebView도 쓰지 않아 배포본에 Chromium이 없고, 세 운영체제에서 같은 결과를 그립니다.',
    ],
    highlights: [
      '10MB 문서에서 키 입력 한 번에 52ms, 1MB에서 4.4ms',
      'CommonMark 0.31.2 스펙 스위트를 CI에서 실행',
      'Windows·macOS·Linux 배포본, 7개 언어 인터페이스',
      'TextMate 문법 강조, 다중 커서, Vim 키 바인딩',
      '계층 간 참조 방향을 아키텍처 테스트로 강제',
    ],
    stack: ['C#', '.NET 10', 'Avalonia', 'Markdig', 'SkiaSharp'],
    repo: `${GITHUB}/markdown-old`,
    release: 'v2.3.1',
  },
  {
    slug: 'connection-verify',
    name: 'Connection Verify',
    icon: 'ticket',
    status: 'archived',
    tagline: '서버 접속마다 번호표를 주는 플러그인',
    summary: 'A Paper plugin that numbers every connection and saves a full report on demand.',
    description: [
      '마인크래프트 서버의 접속마다 짧은 번호를 붙이고, 번호를 입력하면 그 접속의 상세 리포트를 파일로 저장해 주는 플러그인입니다.',
      '데이터베이스도 웹 서버도 없이, 콘솔의 번호 하나와 필요할 때 만드는 텍스트(또는 JSON) 파일이 전부입니다.',
    ],
    highlights: [
      '성공한 접속뿐 아니라 밴·화이트리스트·서버 가득 참·끊긴 접속에도 번호 부여',
      'Log4j2 감시로 이벤트가 없는 이른 연결 끊김까지 포착',
      'Paper·Purpur·Folia 지원, Velocity·BungeeCord·Fabric·NeoForge 에디션',
      'IP 마스킹 등 개인정보 옵션과 한국어/영어 메시지',
      '변경 파일 수에 따라 CI가 버전을 자동으로 올림',
    ],
    stack: ['Java', 'Maven', 'Paper API'],
    repo: `${GITHUB}/connection-verify`,
    release: 'v2.1.3',
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function releaseHref(project: Project): string | undefined {
  return project.release ? `${project.repo}/releases/tag/${project.release}` : undefined
}

export const profile = {
  handle: 'neramc',
  github: GITHUB,
  avatar: 'https://avatars.githubusercontent.com/neramc?size=320',
  source: `${GITHUB}/neramc/tree/main/portfolio`,
}

export const gear: { label: string; items: string[] }[] = [
  { label: '언어', items: ['Rust', 'TypeScript', 'C#', 'Kotlin', 'Java'] },
  {
    label: '프레임워크',
    items: ['Remix', 'Astro', '.NET', 'Avalonia', 'Slint', 'Compose Multiplatform'],
  },
  { label: '도구', items: ['Bun', 'Gradle', 'Maven', 'GitHub Actions', 'Vercel', 'Playwright'] },
]
