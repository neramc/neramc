# 사이트 개발계획

## 서론

근데, 나는 채팅방을 만들다 보니까, 너무 오류가 지주 나기도 하고, 너무 힘들기도 한데, 이 UI 를 유지하면서 새로운걸 만들고 싶어. 일단 거의 모든 버튼들은 하단으로 이동했으면 좋겠어. 

____________________________________

## 본론 - 1 (유의사항 설명)

* 먼저 계획의 **핵심** 을 설명해 주자면 UI 를 간편화 하고, 너가 만들어주는 방식인 app/page.tsx 에 모든 페이지와 코드들을 넣는 방식을 없애고, 각기의 폴더에 파일을 분배해 주었으면 좋겠어. 그리고 입장코드로 로그인 한 사람은 쿠키를 **로컬스토리지**에 보관(사용자 구별용)해줘. 로그아웃 할땐, 쿠키를 지워주게 해줘.

____________________________________

## 본론 - 2 (컴포넌트, 기능 설명)

* /main, /write, /manage, /schedule, /tos (Terms of service), /dm (Direct message), /dashboard (활동내역 확인, 프로필 사진 변경), /history, /docs 로 나눠져 있었으면 좋겠어. 그리고 /main 은 /main?perm=admin/user 식으로 나눠져 있었으면 좋겠어. 그리고 /dm 은 사용자 2명중 먼저 메세지를 보낸사람 순으로, /dm?msg=4512(입장코드, 먼저 보낸사람)&4513(입장코드, 메세지를 받은 사람) 식으로 링크가 생성되고, 이 링크는 서버에 보관되어 계속 있어주었으면 좋겠어. /dm?msg=home 에는 메세지를 보낼 사용자를 선택 가능하게 해주었으면 좋겠어. (프로필 사진도 표시되게.) /dashboard 는 사용자에 따라 /dashboard?user=4512(입장코드) user 의 값 부분에 입장코드가 넣어지면서 그 사람의 프로필 관리창이 표시되었으면 좋겠어. 그리고 user 의 값 부분에 값을 이상하게 입력하거나, 자기 자신이 아닌 다른 사람의 것(로컬스토리지에 저장된 **쿠키** 로 구별)으로 강제로 입력 하면 403 Forbidden 에러가 뜨게 해줘. 그리고 입장코드를 관리자가 /manage 에서 추가를 한다면 서버에 기록이 되어 ? 형식으로 접근이 가능하게 해줘. 그리고, /docs 는 /write 나, /schedule 에서 추가한 글이나, 일정을 불러오는 페이지였으면 좋겠어. 글에 무작위로 8자리 ID(중복 X)를 발급해서 /docs?id=35626238 같은 식으로 글이 로드됬으면 좋겠어. 페이지 구조 설명은 여기 까지 할게.

* **페이지 구성요소**를 설명해줄게. 먼저 사이트에 접속하면, Login 페이지가 나오는데, Login 페이지의 배경[배경: https://i.ifh.cc/OtrKNX.jpg ]은 유지하면서 Login 페이지를 다시 만들어줘. 4자리 코드(관리자는 1829)를 입력할 수 있게 한 뒤, 네자리 코드가 맞으면 통과시켜줘(CSS 는 모던하게 해줘). 일단 로그인 하면 메인페이지가 보일텐데, 여기서 카카오톡 처럼 다른 사람이 글을 올리고 Feed 처럼 5개의 일정 또는 글이 자리해 있었으면 좋겠어. 관리자는 Feed 가 안보이고, 대시보드(/manage) 로 연결되는 버튼만 존재했으면 좋겠어. 내 사이트의 사용자들은 거의 다 핸드폰 이기 때문에 핸드폰 UI 로 만들어주었으면 좋겠어. 그리고 입장했을때 기본 프로필 사진은 [## 아이콘, 폰트 첨부] 섹션을 확인해 주었으면 좋겠어.

* **페이지 작동요소** 를 설명해줄게. 먼저 관리자(1829)가 관리창(/manage) 에서 유저를 추가하면 관리창 유저 추가하는 창 아래에 순서대로 뜰텐데(이전 단톡방 시스템과 똑같음) 거기서 나오는 번호를 Login 페이지(루트: http://나의도메인.도메인/ 바로 들어가면 나오게)에 입력하면 들어올 수 있는데, 로컬스토리지에 저장된 쿠키가 없으면 자동으로 약관페이지로 이동(/tos). 여기서 너가 Termsofservice.md 파일을 마크다운 형식으로 만들어주었으면 좋겠어(내가 방금까지 설명해준 서비스를 바탕으로 작성. 제3자에게 절대 정보제공 X, 다이렉트 메세지는 관리자가 열람할 수 없으므로 온전히 사용자의 책임 등의 내용을 포함해서 길게.)이 .md 파일을 웹에서 로드해 주었으면 좋겠어. 이 .md 파일이 로드되면 처음엔 접혀있는데, 펼쳐서 끝까지 스크롤 해야 체크란에 체크 가능. 그 외에 [극소량의 개인정보 수집], [쿠키정보 허용] 까지 3개의 체크란을 만들고, 하나라도 체크를 하지 않으면 입장 불가하게 버튼을 비활성화 시켜줘. 제일 처음 입장하면 너가 단체톡방 에서 구현해 줬던 맨 위에 있는 단체방 메뉴바는 그대로 한 뒤, 로그아웃 버튼을 햄버거 메뉴로 대체해줘. 햄버거 메뉴를 열면 작은 창이 햄버거 메뉴 위에 뜰텐데 이때, 메뉴말고 그 밖의 창을 클릭하면 메뉴가 닫히게 해줘. 메뉴에는 첫번째로 [DM] (/dm)이, 두번째에는 [글 올리기] (/write), 세번째 에는 [일정] (/schedule) 이, 네번째에는 [서비스 약관] (/tos) 이, 다섯번째는 관리자만 한정으로 [관리창] (/manage)(일반유저에게는 보이지 않음.) 이. 마지막은 왼쪽에 프로필 사진과 함께 이름(사용자 생성할 때 쓴 이름)이 뜨는데 누르면 (/dashboard?user=[자신의 입장코드]) 로 들어가 졌으면 좋겠어. 이 메뉴는 리스트 형식으로 세로로 정렬되었으면 좋겠어. 내가 써준 메뉴 리스트 에는 /dashboard 로 들어가 지는것 말고 모두 왼쪽에 ## 아이콘 폰트첨부 섹션에서 아이콘을 알맞게 가져와 줬으면 좋겠어. 아이콘은 글씨 크기에 맞게 적용해줘. 첫번째로 /main 에 들어오면 첫번째로 카카오톡 피드나 인스타그램처럼 사람이 올린 글이 최신순으로 5개 나열돼. 여기에는 각각 하나씩 칸 안에 글이 최대 3줄( 3줄 이 넘어가면 3줄  끝에 … 으로 미리보기에 표시)까지 표시되고 아래에는 사진이나 지도가 표시되었으면 좋겠어. 그리고 5개가 나열된다고 말 했는데, 피드에 나오는 글 맨 밑으로 가면 open history 라고 가로로 길고 모서리가 둥근 타원형 검은색 버튼을 만들어줘. 버튼을 누르면 /history 로 이동하는데, /history 에는 피드에 뜬 5개의 글과 그 이전의 글을 표시해주었으면 좋겠어. 그리고 관리자는 부적절한 글을 삭제할 수 있었으면 좋겠어. (물론 글 쓴 본인도 삭제 가능.) 그리고 오른쪽 상단 메뉴의 왼쪽에 + 버튼을 추가해줘. 그 버튼을 누르면 /write 로 이동할 수 있게 해줘. /write 에는 맨 위에 메뉴가 있는건 똑같고, 아래에 네이버 밴드처럼 글을 쓸 수 있는 공간이 있었으면 좋겠어. 여기에는 맨 위에 제목을 쓸 수 있는 칸과, 아래에는 자세한 설명을 쓸 수 있게 해줘. 여기에는 마크다운과 글씨 색깔설정, 이미지, 동영상, 파일을 첨부할 수 있었으면 좋겠어. 여기에 링크(http:// 나, https:// 로 시작하거나, 맨 끝에 띄어쓰기 없이, .com, .net, .org, .kr, .us, .co.kr 등의 도메인 확장자가 있으면 링크로 인식)를 추가하면, 링크 미리보기가 표시되었으면 좋겠어(<meta property="og:image"> 를 로드). 그리고, 구글맵지도를 로드할 수 있었으면 좋겠어. [지도 버튼] 아이콘이 툴바에 있었으면 좋겠고, 그 버튼을 클릭하면 구글맵이 로드되고, 지정된 장소를 클릭하면, 맵이 글에 첨부되었으면 좋겠어. 첨부된 맵을 클릭하면 구글맵 앱이 열리면서, 그 장소가 열렸으면 좋겠어. 첨부된 맵은 피드에 올라온 글의 미리보기에 맵이 로드되었으면 좋겠어. 그리고 왼쪽 위에 [올리기] 라는 파란색 버튼이 있었으면 좋겠어. 그 버튼을 누르면 쓴 글이 배포되면서 /main 에 있는 피드에 글이 올라왔으면 좋겠어. 글 저장 로직은 ## 저장기능 섹션에서 확인. 여기에 댓글기능과, 좋아요, 싫어요 버튼을 만들어줬으면 좋겠어. /schedule 페이지 에서는 일정을 추가하는 기능을 추가해 주었으면 좋겠어. 여기에는 /write 페이지 처럼 제목과 설명, 맵 첨부 같은 것을 할 수 있지만, 툴바 아래에 날짜를 설정하는 섹션과, 공개, 비공개를 설정할 수 있었으면 좋겠어. 공개로 설정하면 피드 페이지(/main)에 그 사람이 만든 일정이 표시되었으면 좋겠어. 일정을 추가할 때 지도에서 장소를 추가하면  만나는 장소로 설정되었으면 좋겠어. 이제 /dm 에 대해 설명해 줄게. 처음 메뉴에서 클릭해 들어가면, /dm?msg=home 로 연결되는데, 여기에서는 메세지를 보낼 사람을 선택할 수 있었으면 좋겠어. 사람 이름 옆에(왼쪽) /dashboard 에서 설정하는 프로필 사진을 가져왔으면 좋겠어. 동그라미 모양으로. (Discord 스타일) 이제 대화할 상대를 클릭하거나 터치하면, /dm?msg=4512&4513(예시) (먼저 dm 으로 말을 건 사람의 4자리 입장코드가 앞에 있음)로 연결되야돼. 여기로 들어가면 개인채팅을 할 수 있는데, 핸드폰의 메세지 앱처럼 문자를 쓰는곳 옆(왼쪽)에 + 버튼이 있고, 그 버튼을 누르면 사진, 동영상, 파일을 첨부할 수 있으면 좋겠어. 메세지와 파일은 **Firebase Realtime Database** 에 저장하고, 사진과 동영상은 **ImgBB Api** 로 **ImgBB** 에 저장되었으면 좋겠어. 메세지와 파일중에 용량이 큰 파일, 메세지가 있다면, 30일이 지난 뒤 자동으로 삭제되었으면 좋겠어. 그러면 이번엔 /dashboard 를 설명해줄게. 메뉴에서 자신의 이름과 프로필사진이 떠있는 칸을 클릭하면 /dashboard?user=[자신의 4자리 입장코드] 로 들어가 지는데, 여기선 자신의 프로필 사진(.jpg, .png, .webp, .gif, .heic, .jpeg)을 설정할 수 있어야돼. 그 아래에는 자신의 각종 소셜미디어 링크를 쓸 수 있었으면 좋겠어. 그리고 github 프로필 링크를 첨부하면 프로필 이름 옆에 **개발자 표시** 아이콘이 있었으면 좋겠어(아이콘은 [## 아이콘, 폰트첨부] 섹션에서 확인). 이제 마지막으로 /manage 페이지를 설명해줄게. /manage 는 관리자만 접속할 수 있는 페이지야(강제로 접속시 강제 리디렉션) 여기에서는 먼저 공지를 등록할 수 있었으면 좋겠어. /main 에 메뉴바 아래에 표시. 그리고 두번째로 사용자를 추가할 수 있게 해줘. (기존 단톡방 참고) 그리고 삭제도 할 수 있게 해줘. 이렇게 해서 **페이지 작동 요소** 섹션을 끝낼게.

____________________________________

## 아이콘, 폰트 첨부

사이트 공통 Favicon:
https://i.ifh.cc/wbGymM.png
<link rel="icon">
<link rel="apple-touch-icon">

링크 미리보기용 Favicon:
https://i.ifh.cc/kNVnls.jpg
<meta property="og:image">

페이지 폰트:
@font-face {
    font-family: 'SeoulNotice';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2505-1@1.0/SeoulAlrimTTF-Bold.woff2') format('woff2');
    font-weight: 700;
    font-display: swap;
}

[기본 프로필 사진]:
https://i.ifh.cc/X40Pj9.jpg

햄버거 메뉴:
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=menu" />

[DM]:
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=chat" />

[글 올리기]:
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=edit_square" />

[일정]: 
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=calendar_month" />

[서비스 약관]:
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=contract" />

[관리창]: 
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=terminal" />

[지도 버튼]:
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=add_location_alt" />

[개발자 표시 아이콘]:
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=code_blocks" />

____________________________________
## 저장기능

**Firebase Real Time Database**
와
**ImgBB Api**
를 활용. 

🚀 Firebase + ImgBB 배포 가이드
📦 1. 프로젝트 설정
bash# Next.js 프로젝트 생성
npx create-next-app@latest chat-room --typescript
cd chat-room

# 의존성 설치
npm install firebase lucide-react
🔥 2. Firebase 설정
2.1 Firebase 프로젝트 생성

https://console.firebase.google.com 접속
프로젝트 추가 클릭
프로젝트 이름 입력 (예: chatroom)
Google Analytics는 선택사항

2.2 Realtime Database 생성

좌측 메뉴 → Realtime Database
데이터베이스 만들기 클릭
지역 선택 (예: us-central1)
테스트 모드로 시작 선택 (나중에 규칙 변경 가능)

2.3 보안 규칙 설정
Realtime Database → 규칙 탭에서 다음 규칙 적용:
json{
  "rules": {
    ".read": true,
    ".write": true
  }
}
⚠️ 주의: 프로덕션에서는 더 엄격한 규칙 사용 권장
2.4 웹 앱 설정

프로젝트 설정 → 앱 추가 → 웹 앱 선택
앱 닉네임 입력
Firebase SDK 구성 정보 복사

🖼️ 3. ImgBB 설정
3.1 API Key 발급 (30초 완료!)

https://api.imgbb.com 접속
Get API Key 클릭
이메일 입력 (무료 가입)
API Key 즉시 발급! ✅

예시: a1b2c3d4e5f6g7h8i9j0
3.2 특징

✅ 무제한 업로드 (완전 무료!)
✅ 카드 등록 불필요
✅ CDN 지원 (빠른 속도)
✅ 간단한 API
⚠️ 공개 이미지만 가능 (URL 알면 누구나 접근)

📝 4. 환경변수 설정
4.1 로컬 개발 (.env.local)
프로젝트 루트에 .env.local 파일 생성:
''' env
env# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chatroom-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://chatroom-xxxxx.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chatroom-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chatroom-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# ImgBB (무료 무제한!)
NEXT_PUBLIC_IMGBB_API_KEY=a1b2c3d4e5f6g7h8i9j0
'''

____________________________________

## 전반적인 스타일

* Windows 11 에 자주 쓰이는 반투명 아크릴 UI 형식

____________________________________
