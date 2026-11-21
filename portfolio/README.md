# neramc 포트폴리오

[Remix 3](https://remix.run)로 만든 웹 포트폴리오입니다. 프로필 README와 같은 픽셀아트 테마를 쓰고, 라이트/다크 모드는 시스템 설정을 따릅니다.

- **홈** `/`: 곡괭이가 글자를 캐는 히어로, 직접 명령어를 입력하는 터미널, 프로젝트 인벤토리, 기술 스택
- **인벤토리** `/projects`: 진행 중인 프로젝트와 보관된 프로젝트
- **프로젝트** `/projects/:slug`: 소개, 특징, 스택, 저장소·릴리스 링크
- 없는 주소는 픽셀 404 페이지로 응답합니다.

## 실행

Node.js 24.3 이상이 필요합니다.

```sh
npm i
npm run dev        # http://localhost:44100, 파일이 바뀌면 서버 재시작
npm run hmr        # 서버와 브라우저 핫 리로드
npm start          # 프로덕션 모드 (별도 빌드 단계 없음)
npm test           # 라우터·명령어 테스트
npm run typecheck
```

## 구조

| 경로 | 내용 |
|---|---|
| `app/routes.ts` | URL 계약. 링크와 리다이렉트는 모두 `routes.*.href()`로 만듭니다. |
| `app/router.ts` | 미들웨어(정적 파일, 렌더링), 컨트롤러 연결, 404 처리 |
| `app/actions/` | 컨트롤러와 페이지. `projects/`는 `/projects` 라우트 묶음 |
| `app/actions/public/` | 브라우저로 가는 코드: 런타임 엔트리, 터미널(`clientEntry`), 전역 CSS |
| `app/data/projects.ts` | 프로젝트 내용. 각 저장소의 README에 있는 사실만 적습니다. |
| `app/ui/` | 여러 페이지가 함께 쓰는 레이아웃, 아이템 카드, 픽셀 글꼴·아이콘 |

### 터미널

페이지에서 하이드레이트되는 컴포넌트는 터미널 하나뿐입니다. 명령어 해석기(`app/actions/public/terminal-commands.ts`)는 DOM에 의존하지 않는 순수 함수라서 브라우저와 서버가 함께 씁니다. 자바스크립트가 꺼져 있으면 입력창이 `/?cmd=…`로 GET 요청을 보내고, 서버가 같은 해석기로 결과를 그리거나 `open`이면 프로젝트 페이지로 리다이렉트합니다.

### 픽셀아트

`app/ui/pixel-art.ts`와 `public/favicon.svg`는 저장소 루트의 `scripts/build_assets.py`가 프로필 README 그림과 같은 데이터로 만듭니다. 글꼴이나 아이콘을 바꾸려면 그 스크립트를 고치고 다시 실행하세요.

```sh
python3 ../scripts/build_assets.py
```
