# neramc 포트폴리오

[Remix 3](https://remix.run)로 만든 웹 포트폴리오입니다. Vite로 빌드하고 Nitro로 배포하며, 프로필 README와 같은 픽셀아트 테마를 씁니다. 라이트/다크 모드는 시스템 설정을 따릅니다.

- **홈** `/`: 곡괭이가 글자를 캐는 히어로, 직접 명령어를 입력하는 터미널, 프로젝트 인벤토리, 기술 스택
- **인벤토리** `/projects`: 진행 중인 프로젝트와 보관된 프로젝트
- **프로젝트** `/projects/:slug`: 소개, 특징, 스택, 저장소·릴리스 링크
- 없는 주소는 픽셀 404 페이지로 응답합니다.

## 실행

Node.js 24.3 이상이 필요합니다.

```sh
npm i
npm run dev        # http://localhost:5173, Vite 개발 서버(HMR)
npm run build      # .output/ 에 서버와 정적 자산 생성
npm run preview    # 빌드 결과를 로컬에서 실행
npm test           # 라우터·명령어 테스트
npm run typecheck
```

## 배포

`npm run build`는 Nitro가 감지한 플랫폼의 산출물을 만듭니다. Vercel 빌드처럼 `VERCEL=1`이 설정된
환경에서는 [Build Output API](https://vercel.com/docs/build-output-api/v3) 형식으로
`.vercel/output/`(Vercel Functions + `static/` CDN 자산)을 생성합니다.

Vercel 프로젝트의 **Root Directory는 `portfolio`** 로 두고, 빌드 명령은 기본값(`npm run build`)을
사용합니다. 빌드가 `.vercel/output`을 만들므로 Vercel은 자체 프레임워크 빌드 대신 이 산출물을
그대로 배포합니다.

## 구조

| 경로 | 내용 |
|---|---|
| `vite.config.ts` | Vite + Nitro + Remix 3 플러그인 설정 |
| `app/router.ts` | 미들웨어(렌더링), 컨트롤러 연결, 404 처리 |
| `app/routes.ts` | URL 계약. 링크와 리다이렉트는 모두 `routes.*.href()`로 만듭니다. |
| `app/entry.server.ts` | Nitro에 넘기는 SSR 엔트리(`fetch: router.fetch`)와 빌드된 클라이언트 자산 URL |
| `app/entry.client.ts` | 브라우저 런타임. `import.meta.glob`으로 클라이언트 엔트리 모듈을 찾습니다 |
| `app/client-assets.ts` | 문서 셸이 쓰는 스크립트·스타일 URL 보관소 |
| `app/actions/` | 컨트롤러와 페이지. `projects/`는 `/projects` 라우트 묶음 |
| `app/actions/public/` | 브라우저로 가는 코드: 터미널(`clientEntry`), 전역 CSS, 명령어 해석기 |
| `app/data/projects.ts` | 프로젝트 내용. 각 저장소의 README에 있는 사실만 적습니다. |
| `app/ui/` | 여러 페이지가 함께 쓰는 레이아웃, 아이템 카드, 픽셀 글꼴·아이콘 |

### 자산

예전에는 `remix/assets`의 `createAssetServer`가 요청 시점에 브라우저 코드를 컴파일했습니다. 지금은
Vite가 빌드 시점에 클라이언트 번들을 만들고 Nitro가 정적 자산으로 서빙합니다. 문서 셸은
`app/entry.server.ts`의 `?assets=client` import로 해시된 스크립트·스타일 URL을 받아 그립니다.

### 터미널

페이지에서 하이드레이트되는 컴포넌트는 터미널 하나뿐입니다. `clientEntry()`의 엔트리 id는
`/assets/app/actions/public/terminal.tsx#Terminal` 같은 공개 URL이고, `app/entry.client.ts`가
`/assets` 접두사를 떼어 `import.meta.glob` 맵에서 빌드된 청크를 찾습니다. 명령어 해석기
(`app/actions/public/terminal-commands.ts`)는 DOM에 의존하지 않는 순수 함수라서 브라우저와 서버가
함께 씁니다. 자바스크립트가 꺼져 있으면 입력창이 `/?cmd=…`로 GET 요청을 보내고, 서버가 같은
해석기로 결과를 그리거나 `open`이면 프로젝트 페이지로 리다이렉트합니다.

### 픽셀아트

`app/ui/pixel-art.ts`와 `public/favicon.svg`는 저장소 루트의 `scripts/build_assets.py`가 프로필
README 그림과 같은 데이터로 만듭니다. 글꼴이나 아이콘을 바꾸려면 그 스크립트를 고치고 다시
실행하세요.

```sh
python3 ../scripts/build_assets.py
```
