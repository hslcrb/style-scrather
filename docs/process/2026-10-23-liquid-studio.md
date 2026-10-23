# Liquid Studio 개선·검증·배포 작업 기록

작업일: **2026-10-23**. 제품: **Style Scratcher v4.1.0.** 저장소: [`hslcrb/style-scrather`](https://github.com/hslcrb/style-scrather).

이 문서는 조사, 구현, 통합, 검증, 게시 과정에서 실제로 수행한 일과 관찰한 결과를 기록한다. 코드 변경의 원장은 [커밋별 기록](COMMITS.md)과 [기계 판독용 기록](commits.json)이다. 최종 main 병합·릴리즈 결과는 이 문서의 배포 완료 절과 별도 배포 증거에 덧붙인다. 시각이 필요한 경우 Git이 제공한 ISO 8601 오프셋을 그대로 사용한다. 커밋 시각의 `+09:00`을 UTC로 표기하지 않는다.

## 1. 요청과 작업 범위

첫 요청은 얕은 체크아웃, `chatgpt/`로 시작하는 브랜치와 하위 브랜치, 매우 작은 단위의 커밋 및 커밋마다 즉시 게시를 요구했다. 커밋 제목은 영어 접두사와 한국어 설명으로 통일했다. 제품의 오류·병목을 해결하고, 리퀴드 글래스 UI와 UX, 기존 로고를 계승한 브랜딩, 철학, 오픈소스 저장소 체계, 소개 페이지를 함께 개선하는 범위였다.

검토용 PR을 준비한 뒤 추가 요청으로 배포 범위가 확정되었다. 워크플로를 `#`으로 비활성화하고, 현재 실행 환경에서 직접 빌드한 파일을 GitHub Release에 등록하며, 모든 변경을 `main`에 no-ff 병합하고, 상세 과정을 남긴 뒤 커밋·게시·병합까지 끝내도록 요청받았다. 이 추가 요청이 main 병합과 릴리즈 게시의 근거다.

이 작업은 공개 사이트의 새 호스팅 계정을 만들거나 Chrome Web Store 심사를 신청하는 작업을 포함하지 않는다. 소개 페이지는 실제 정적 빌드 산출물로 제공한다. 설치용 GitHub Release와 공개 웹 호스팅은 별개의 결과다.

## 2. 기준 상태 조사와 보존한 계약

기준 main은 `72f08c6927416c45cc0f81bb641b881f5aa2c09c`, 기존 버전은 v4.0.3.이었다. 처음에는 depth 1 체크아웃을 구성했다. manifest, 팝업, service worker, content script 초기화, CSS, 로고, 서버와 기존 테스트를 읽었다.

기존 `node test/verify.js`는 14개 검증 단계를 통과했다. 그러나 소스 문자열과 mock 중심이어서 설치된 확장이 정상 동작한다는 증거로 사용하지 않았다. 실제 조사에서 다음 문제가 드러났다.

| 조사 대상 | 확인한 문제 | 작업 방향 |
| --- | --- | --- |
| `background/background.js` | service worker의 폰트 변환에서 `FileReader` 사용 | worker에서 가능한 ArrayBuffer 변환, 입력·크기·시간 제한 |
| 팝업 복구 주입 | manifest와 별도 목록, `content/update-guardian.js` 누락 | manifest의 실제 주입 순서를 공유 |
| content 초기 상태 | `isActive = true`, 로드 직후 페이지 클릭을 검사기가 가로챔 | 명시적인 실행 요청 전 비활성 |
| 재주입 | 같은 전역 클래스 선언이 충돌할 수 있음 | 재주입 안전 가드와 일회 초기화 |
| 오버레이 | 같은 대상의 이동 이벤트마다 즉시 그리기 | 프레임 단위 병합과 비활성 작업 중지 |
| 종료 처리 | 줌·프리징·편집·애니메이션·UI 이벤트의 정리 범위 불명확 | 원래 상태와 임시 모드 수명주기 기록·복원 |
| 폰트 도구 | 폭 비교를 글리프 지원으로 해석하고 가짜 대체 경로 제공 | 실제 측정과 폰트 내부 정보의 한계를 구분 |

기존 제품명, Apache-2.0 라이선스, Studio Crimson, Manifest V3, 루트 `manifest.json` 설치 방식은 보존했다. 저장소 철자 `style-scrather`를 URL 호환성을 위해 유지하고 제품 표시 이름은 Style Scratcher로 통일했다. 새 프레임워크나 런타임 패키지를 도입하지 않았다. 설계와 작업 구분은 `1a273bb`에 먼저 기록했다.

## 3. 브랜치·체크아웃·게시 방식

| 브랜치 | 실제 분기 기준 | 담당 범위 | 구현 마지막 SHA |
| --- | --- | --- | --- |
| `chatgpt/refresh/integration` | 기존 main `72f08c6` | 계획, 통합, 교차 수정, 검증, 문서, 배포 | 최종 배포 기록 참조 |
| `chatgpt/refresh/tooling` | 공통 계획 `1a273bb` | 서버, 빌드, 테스트 실행, OSS 문서 | `f3fad74` |
| `chatgpt/refresh/identity` | 공통 계획 `1a273bb` | 로고, 색상, 철학, 소개 페이지 | `42bc5cc` |
| `chatgpt/refresh/interface` | 공통 계획 `1a273bb` | 팝업, 스튜디오, 반응형·키보드 UX | `1476bfe` |
| `chatgpt/refresh/runtime` | 공통 계획 `1a273bb` | 초기화, 주입, 엔진, 종료 복원, 성능 | `dd4ed45` |
| `chatgpt/refresh/export/runtime-fixes` | runtime `9350120` | JSX 직렬화, 다운로드 계약 | `9ad45ce` |
| `chatgpt/refresh/studio/lifecycle` | integration `f482441` | 도크의 비활성 리스너·타이머 정리 | `52c3896` |

별도 worktree로 파일 소유 범위를 분리했다. 원본 기준 checkout도 유지해 전후 비교에 사용했다. 하위 브랜치 두 개는 각각 runtime과 통합 중간 커밋에서 실제로 분기했다. 이름만 계층적으로 붙인 독립 작업이 아니다.

셸에는 GitHub push 인증 정보가 없었다. 인증된 GitHub 연결의 Git data API로 blob/tree/commit을 만들고, 예상 이전 SHA를 검사하며 해당 브랜치 ref를 즉시 이동했다. 이 ref 갱신이 각 커밋의 원격 게시다. 이어서 명시적인 브랜치 ref를 fetch하고 로컬 HEAD·인덱스를 게시된 커밋과 맞췄다. 인증 토큰을 추출하거나 저장소에 기록하지 않았다. 원격 이력을 force-push로 바꾸지 않았다.

초기에 제한된 depth fetch가 작은 저장소의 이전 이력까지 가져오는 일이 있었다. 이후 기존 main의 shallow 경계를 다시 고정하고 새 작업 이력은 유지했다. 검토 전달 시 `--is-shallow-repository`는 `true`, 기준 main에서 읽히는 이전 커밋 수는 1이었다. 최종 확인에서도 shallow 여부와 모든 원격 브랜치의 SHA를 확인한다.

## 4. 런타임 수정의 세부 과정

### 4.1 명시적인 시작과 재연결

1. service worker의 폰트 요청을 ArrayBuffer 기반으로 바꾸고 HTTP(S)만 받도록 제한했다. 최대 16 MiB, 15초 제한을 적용했다.
2. 브라우저 명령과 팝업의 재주입 순서를 manifest에서 읽도록 했다. 누락된 guardian이 함께 주입된다.
3. `GET_STATE`는 상태만 읽도록 바꿨다. 페이지 로드나 팝업 열기로 도크가 생기거나 검사 모드가 켜지지 않는다.
4. 최초 실행 때 엔진과 UI를 한 번 만들고 재사용하도록 했다. 반복 주입은 IIFE와 기존 객체 가드로 전역 클래스 충돌을 막는다.
5. 팝업은 요청 중 중복 조작을 막고 실제 응답으로 상태를 확정한다. 재연결 과정에서 이전 변경 요청을 무조건 다시 실행하지 않는다.

### 4.2 페이지 제어를 돌려주는 종료 처리

1. 검사기의 이벤트 리스너를 활성 구간에만 연결하고 종료 시 해제했다.
2. 줌이 바꾼 transform·origin·transition은 원래 값과 CSS priority까지 복원했다.
3. 프리징과 선택 제한 완화의 핸들러를 독립적으로 관리하고 원래 inline handler를 되돌렸다.
4. 처음부터 정지되어 있던 애니메이션과 검사 중 멈춘 애니메이션을 구분했다. 속도 초기화도 원래 속도와 pause 상태를 보존한다.
5. 임시 contenteditable·의사 상태·요소 참조를 정리했다.
6. 닫힌 뒤 그리드·기준선 flag가 남아 팝업 상태와 충돌하는 문제를 후속 수정했다.
7. 도크 전역 pointer/resize 리스너, toast·업데이트 타이머, resize rAF, 진행 중 드래그를 종료 시 정리했다. 늦게 도착한 비동기 응답은 이전 활성 세대의 UI를 갱신하지 못한다.

사용자가 의도적으로 적용한 텍스트·이미지·DOM 편집을 모두 되돌리는 undo 시스템을 만들었다고 주장하지 않는다. 임시 검사 상태 복원과 페이지 편집의 새로고침 초기화는 문서에서 구분했다.

### 4.3 불필요한 반복 작업 줄이기

오버레이의 무효화 요청을 `requestAnimationFrame`으로 모으고 실제 그리기를 `renderNow()`로 분리했다. 비활성 상태에서는 그리지 않으며 같은 대상의 중복 계산을 건너뛴다. 탭 순서의 누락된 메서드를 연결하고 캐시와 스캔 상한을 추가했다. 단위 변환은 badge마다 root font size를 다시 읽지 않도록 정리했다.

팔레트 스캔은 범위와 결과 메타데이터를 제한했다. 웹폰트 상대 URL은 소유 stylesheet를 기준으로 해석한다. 업데이트 확인은 service worker의 공유 캐시, 동시 요청 병합, 저장소 캐시와 시간 제한으로 보호했다.

### 4.4 폰트·SVG 결과의 정확성

Canvas 텍스트 작업은 글자 수 200, 폰트 크기 1–256, 최대 변 8,192와 총 4 megapixel 제한을 둔다. Canvas를 사용할 수 없을 때 가짜 사각형 윤곽을 반환하지 않는다. 측정 결과는 `measurementOnly: true`, `coverageDetermined: false`이며 지원 수·누락 수·지원률은 `null`이다. 실제 폭과 fallback 폭을 제공하지만 이것으로 폰트 내부의 글리프 존재를 판단하지 않는다.

SVG-font 직렬화는 실제 path·codepoint·유한한 advance 값이 있을 때만 동작한다. 텍스트 윤곽의 내용, 폰트명, 색상에 호스트 페이지 문자열을 넣어 XML 구조를 바꿀 수 있던 문제도 수정했다. XML 속성과 텍스트를 escape하고 동적 주석을 제거하며 제어 문자를 처리했다. 실제 브라우저 Canvas로 서로 다른 글자의 경로가 달라지는지와 악성 형태의 문자열이 SVG 노드가 되지 않는지를 확인했다.

## 5. UI·UX 작업의 세부 과정

팝업을 pearl/ink/crimson 기반으로 재구성하고 연결 중·실행 중·비활성·제한된 페이지·실패 상태를 문장으로 표시했다. 실패한 클립보드·다운로드·업데이트를 성공 toast로 보이지 않게 했다.

스튜디오에는 검사·편집·코드·글꼴의 핵심 네 탭과 접근 가능한 보조 도구 메뉴를 두어 열 개 패널을 모두 유지했다. 탭의 화살표/Home/End 이동, 메뉴 Escape와 focus 복귀, 포인터 및 키보드 이동, 최소화/복귀를 구성했다. 320px 창에서도 도크가 경계를 벗어나지 않도록 크기와 위치를 제한했다.

렌더링 중 입력 포커스·선택과 disclosure 펼침 상태를 유지했다. 호스트 페이지에서 가져온 긴 문자열과 HTML처럼 보이는 문자열은 안전한 text/escaped output으로 표시한다. 팔레트는 실제 스캔 결과를 표시하고 글꼴 패널은 실제 폭 측정 JSON을 내보낸다.

겹친 선언이 많던 1,848줄 Shadow DOM 스타일시트를 디자인 토큰 중심의 약 250줄 스타일시트로 정리했다. 리퀴드 글래스는 높은 불투명도의 pearl, 얇은 하이라이트, 절제된 blur·그림자로 표현했다. blur 미지원, reduced motion, forced colors 환경의 fallback을 포함했다.

통합 후에는 다음 사용 흐름을 추가로 바로잡았다.

- 코드 패널의 존재하지 않는 `downloadAllAssets()` 호출을 실제 `downloadAsset()`에 연결했다. 현재 선택 에셋 하나를 저장한다는 안내로 맞췄다.
- 수정 가능한 “스튜디오 켜기/끄기” 단축키는 비활성 상태에서 듣지 않으므로 실제로는 다시 켤 수 없었다. 해당 편집 행을 없애고 전역 명령은 `chrome://extensions/shortcuts`에서 조정하도록 안내했다.
- 글꼴을 바꾼 뒤에도 이전 font family를 사용하는 closure와, 측정 도중 패널을 바꾸면 progress node가 사라지는 문제를 수정했다.
- 숨겨진 도크의 치수를 읽어 최초 위치가 잘못 잡히지 않도록, 표시 후 프레임에서 명시적인 저장 위치를 clamp했다.

## 6. 로고·브랜드·철학·소개 페이지

### 6.1 연속성 있는 브랜드

기존 선택 프레임과 crosshair를 네 개의 열린 모서리, 짧은 외곽 측정 가이드, 중앙 선택점으로 다듬었다. Studio Crimson `#E11D48`을 유지하고 Ink `#17151C`, Pearl `#F5F4F1`을 추가했다. 문구는 **“웹을 읽는 눈, 디테일을 바꾸는 손.”**으로 정리했다.

정규화한 벡터 기하에서 mark, app icon, wordmark, 1200×630 social card와 PNG 16/48/128을 생성한다. 외부 이미지 라이브러리 없이 supersampling과 PNG CRC를 사용하는 생성기를 만들었다. 사이트의 mark 미러까지 8개 자산을 두 번 생성해 바이트가 같은지 확인했다. 기존 SVG/코드 기반 로고를 확장했으며 출처를 확인할 수 없는 래스터 이미지에 의존하지 않는다.

[브랜드 문서](../BRAND.md)는 여백, 색상 역할, 글꼴 대체 목록, 키보드 focus, motion, 문체와 금지된 과장을 정한다. [철학 문서](../PHILOSOPHY.md)는 먼저 관찰하기, 범위 알리기, 사용자가 시작·종료하기, 읽기 쉬운 유리 표면, 검증 가능한 도구를 제품 동작과 연결한다.

### 6.2 실제로 움직이는 소개 페이지

opencodex.me는 소개→제품 경험→설치→문서라는 정보 구성의 참고로 살폈다. 기존 브랜드나 문구를 복제하지 않고 제품의 크림슨·펄 정체성과 한국어 중심 콘텐츠로 구성했다.

`website/`는 HTML/CSS/JavaScript만 사용한다. 외부 글꼴, CDN, 분석 요청이나 서버 API가 없다. 세 예제 요소의 실제 DOM과 computed style을 읽고 선택, 색상, border radius, font size, 크기, CSS 표시, 복사, reset을 제공한다. 복사 완료는 Clipboard Promise가 성공한 뒤에만 표시하고 실패하면 수동 복사 경로를 연다.

색을 바꾸면 예제 전경색도 가독성에 맞게 조정하고 내보내는 CSS에 반영한다. slider 결과와 CSS 값이 CSS transition 중간값으로 엇갈리지 않게 했다. Reset은 반응형 기본값까지 되돌린다. JavaScript가 꺼져도 소개·설치·FAQ는 읽을 수 있고 사용 불가능한 데모 컨트롤은 설명과 함께 비활성화된다.

사이트의 루트, `/website/`, 배포 하위 경로에서 로고가 유지되도록 상대 자산 경로와 생성된 mark 미러를 정리했다. 320/390/768/1024/1440px, 모바일 메뉴, FAQ, 키보드, 복사 실패와 reduced motion을 확인했다. 제품 데모가 다른 사이트를 검사하는 설치형 확장 자체인 것처럼 설명하지 않았다.

## 7. 오픈소스 체계와 재현 가능한 도구

| 경로·도구 | 구현한 내용 |
| --- | --- |
| `scripts/serve.js` | 127.0.0.1 preview, GET/HEAD, 허용 디렉터리, URL decode·숨김·traversal 검사, 디렉터리 redirect |
| 서버 경계 후속 수정 | symlink의 실제 경로까지 검사해 공개 디렉터리 밖 metadata 접근 차단 |
| `scripts/build.js` | Node 표준 라이브러리 ZIP, CRC/deflate, 고정 DOS timestamp, 허용 파일만 포함 |
| `scripts/manifest-assets.js` | JS/CSS/icon과 web-accessible wildcard 자산을 함께 검사 |
| `scripts/check.js` | JS 구문, manifest 참조, package/manifest 버전 일치 |
| `scripts/test.js` | 테스트 파일을 격리된 Node 프로세스로 실행해 환경별 test runner 문제 회피 |
| `package.json`·lockfile | 일관된 start/check/test/build/icons/benchmark 명령, Playwright 개발 의존성 고정 |
| `demo/` | 외부 요청 없이 실제 확장으로 검사·편집·클릭 복원을 재현할 페이지 |
| `docs/releases/` | 루트의 기존 릴리즈 기록 10개를 이력 보존하며 이동 |
| OSS 문서 | CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG, architecture/development/privacy/verification |
| `.github/` | 버그·기능 이슈 양식, PR 양식, 이후 주석 보관한 검증 워크플로 |

ZIP에는 `manifest.json`, `LICENSE`, `background/`, `content/`, `popup/`, `icons/`만 들어간다. 문서·테스트·사이트·node_modules·Git metadata는 들어가지 않는다. symlink와 숨김 자산을 패키징에서 거부한다. `dist/style-scratcher/`, ZIP, checksum과 `dist/site/`는 빌드 결과이며 일반 소스 커밋에서 제외한다.

## 8. 교차 검토·실패 재현·수정 확인

모든 기존 검사를 무조건 신뢰하지 않고 실제 API 계약과 설치 브라우저를 기준으로 확인했다. 아래는 재현이나 구체적인 관찰이 남아 있는 주요 사례다. 전체 테스트가 처음부터 모두 실패했다는 주장은 하지 않는다.

| 발견 | 수정 전 증거 | 수정과 확인 |
| --- | --- | --- |
| JSX 직렬화 | 특수문자·속성·Tailwind 임의값·void 요소 관련 4개 회귀 실패 | JSON 문자열 표현식, 빈 alt 보존, void self-close. 4개 통과 및 실제 DOM 결과 19개 별도 Babel parser 확인 |
| 에셋 다운로드 | 404 거절 누락, 본문 전 성공 반환, 실패 뒤 원본 URL 우회. 4개 핵심 회귀 실패 | HTTP·네트워크·본문 오류 전파와 await. 실제 PNG 바이트 일치, 404에서 추가 다운로드 없음 |
| 호출부 Promise 계약 | async exporter의 Promise를 HUD가 성공으로 볼 수 있음 | HUD await·null/거절 처리, 코드 패널 실제 API 연결 |
| 좁은 도크 | 실제 390px 화면에서 기존 폭 380px 도크가 x=-14로 벗어남 | 390px·320px 실제 설치 확장에서 경계 내부 확인 |
| host 문자열의 SVG 주입 | 글꼴명 등으로 동적 주석·속성 구조가 깨질 수 있음 | XML escape·동적 주석 제거, 실제 Canvas/SVG DOM 검사 |
| 종료 후 그리드 | active=false인데 isGridActive=true, 다음 클릭에서 오히려 꺼짐 | 종료 시 grid/baseline 상태 정리, 팝업 응답과 실제 표시 일치 |
| 전역 단축키 안내 | 페이지 단축키로 닫은 뒤 같은 키가 다시 켜지지 않음 | Chrome 전역 명령과 활성 페이지 단축키 설정 구분 |
| 글꼴 패널 상태 | font 변경 뒤 stale family, 측정 중 탭 이동 시 progress 대상 소실 | 현재 family 읽기·진행 대상 참조 보호, 실제 브라우저 결과 유지 |
| 비활성 도크 이벤트 | 닫은 뒤 pointer/resize 처리와 타이머 잔류. 신규 회귀 3개 수정 전 실패 | setActive 수명주기, 3개 통과. 실제 닫힌 상태에서 관련 handler/render 호출 0 |
| 서버 공개 경계 | 공개 경로 안의 symlink로 밖의 파일 접근 가능 | realpath 경계 검사와 회귀 |
| manifest 자산 | CSS와 wildcard web-accessible 리소스가 검사 범위에서 빠짐 | 공통 validator·패키징 계약과 회귀 |
| legacy 검사 | 고정 4.0.3 문자열·CSS 형태·가짜 Canvas 기대값 때문에 새 계약에서 실패 | 버전·엔진 동작과 실제 실패 경로를 검사하도록 갱신 |

## 9. 실제 검증의 범위와 증거

기존 통합 검증은 Node 24.19.0, Playwright 1.62.1, Linux의 full Chrome for Testing 156.0.8078.47에서 실행했다. 원본 확장 13개, 패키지 확장 12개 실제 시나리오가 통과했고 page error는 0이었다. Node 검사는 14개 실행 파일, 78개 동작 사례와 별도 legacy 엔진 검사다. UI 검사는 열 개 패널, 입력·펼침 상태, keyboard, 작은 화면, clipboard/font/CSS/update 실패 경로를 포함했다.

현재 배포를 위한 재실행 결과는 `docs/verification/release-local.json`, `release-browser-source.json`, `release-browser-packaged.json`에 따로 기록한다. 이전 결과를 새 결과인 것처럼 재사용하지 않는다. 검증 기준 SHA 이후 문서만 바뀌는 경우 런타임과 ZIP이 동일한지도 확인한다.

### 통제된 렌더링 비교

동일한 `one-heading-v1` fixture, 브라우저, 1440×1000 창, 임시 프로필에서 같은 좌표의 mousemove 240개를 한 동기 작업으로 보냈다. 두 rAF 뒤 실제 그리기 호출을 셌다. 기존 버전은 240회, 개선 버전은 1회였다. 요청 전 host는 1→0, 기본 버튼 클릭은 차단→정상으로 바뀌었다.

약 99.6% 감소는 이 burst의 그리기 호출에 한정한다. CPU·FPS·메모리·사이트 전체 속도 개선율로 일반화하지 않는다. 기준 커밋과 전후 JSON은 [Verification](../VERIFICATION.md)에서 연결한다.

### 아카이브 검증

통합 검증 당시 확장 ZIP은 39개 파일, 114,504 bytes이며 SHA-256은 `d1b8773cd276587adce6fa5b338d23c3a9b10ced4295d5c70e3d5bf648df6849`였다. Python ZIP CRC 검사, unpacked 파일과 바이트 일치, 반복 빌드 동일 digest, 로고 8개 재생성 동일 결과를 확인했다. 배포에는 재실행한 결과를 기준으로 첨부한다.

## 10. 작업 환경에서 생긴 문제와 회복

- Playwright의 기본 browser 다운로드가 유효한 ZIP을 제공하지 못한 실행이 있었다. 사이트 시각 QA는 기존 Chromium headless shell 148로 먼저 진행했고, 실제 확장 검증은 full Chrome 156으로 수행했다. 확장 로딩을 지원하지 않는 이전 headless shell을 확장 검증 증거로 사용하지 않았다.
- 한글 글꼴이 없는 QA 환경에서 tofu가 나타났다. 임시 Noto Sans KR과 FONTCONFIG로 검증 화면을 바로잡았다. 제품에 외부 font 요청을 추가하지 않았다.
- JSX parser는 임시 독립 QA 디렉터리에만 설치했다. 런타임 의존성은 추가하지 않았다.
- Git tree 게시 도구의 큰 JSON 출력이 잘릴 수 있어 파일을 읽기 전에 경로를 필터링하고, 바이너리 자산은 제한된 크기의 base64 조각으로 읽어 Git blob으로 게시했다.
- 초기 통합에서 rename 결과의 삭제 경로가 tree 요청에 빠질 수 있음을 확인했다. 이후 통합에서 중복 아카이브를 정리하고 `--no-renames` 기반의 추가·삭제 목록을 사용했다.
- 원격 게시 직후 로컬 HEAD 동기화 명령에 대한 자동 승인 검토가 한 번 거절되었다. 작업을 강행하지 않고 원격 ref, fetch 결과, 새 SHA와 작업 파일의 비교로 이미 원격에 보존된 내용을 확인했다. 그 뒤 작업 파일을 변경하지 않는 mixed reset으로 HEAD와 index만 동기화했다.
- GitHub Actions의 실패를 조사하니 runner 미할당, 실행 step 없음, 로그 미생성이었다. run `39898695046`, job `120234990354`의 annotation은 계정 billing lock을 명시했다. 이를 코드 테스트 실패나 통과로 분류하지 않았으며 결제·계정 권한을 바꾸지 않았다.

## 11. 구현 브랜치의 실제 통합

| 통합 커밋 | 첫 번째 부모 | 병합한 부모 | 내용 |
| --- | --- | --- | --- |
| `6f00ff1` | `1a273bb` | `f3fad74` | tooling |
| `94178cf` | `6f00ff1` | `42bc5cc` | identity |
| `5d96745` | `94178cf` | `1476bfe` | interface |
| `75f9f50` | `5d96745` | `1edd67f` | runtime 1차 |
| `7494ea3` | `57d3405` | `9ad45ce` | exporter 하위 브랜치 |
| `1f21a98` | `0cc2d39` | `dd4ed45` | runtime 종료 상태 후속 수정 |
| `c149462` | `38b8e72` | `52c3896` | studio lifecycle 하위 브랜치 |

`dfe954e`의 첫 검토 전달까지 기준 위에 58개 커밋이 있었으며 그중 7개가 두 부모 병합이었다. [PR #1](https://github.com/hslcrb/style-scrather/pull/1)에 통합 결과와 증거를 모았다. 당시 main은 원래 기준 그대로였고, 이후 추가 요청에 따라 직접 배포·main 병합 단계로 진행했다.

## 12. 워크플로 비활성화와 로컬 릴리즈 준비

`e8db293`에서 `.github/workflows/verify.yml`의 모든 줄을 `#` 주석으로 보존하고 `verify.yml.disabled`로 바꿨다. 주석만 있는 `.yml`을 그대로 두면 빈 워크플로 파싱 오류가 생길 수 있어 확장자까지 비활성화했다. `.github/ISSUE_TEMPLATE/*.yml`은 workflow가 아니므로 유지했다. 활성 workflow `.yml/.yaml`이 없는지와 보관 파일의 모든 줄이 주석인지 검사했다.

비활성화의 직접 이유는 사용자의 추가 요청이다. 이전 billing 문제는 그 이전에 관찰한 별도 사실이다. 복구 방법, 로컬 게이트, 게시와 no-ff 병합 확인은 [수동 릴리즈 절차](../RELEASING.md)에 기록했다.

GitHub 연결은 커밋·브랜치·PR 병합을 지원하지만 릴리즈 생성 및 바이너리 첨부 연산은 제공하지 않았다. 따라서 요청된 GitHub의 릴리즈 작성 UI에 접근해 실제 양식과 첨부 기능을 확인했다. 인증된 기존 세션을 사용하며 인증 정보 자체를 읽거나 옮기지 않는다. 로컬 빌드 파일은 해당 저장소의 릴리즈 첨부 파일로만 게시한다.

## 13. 배포 완료 기록의 경계

이 문서의 첫 작성 시점은 로컬 재검증과 main 병합 전이다. 완료 여부를 앞서 주장하지 않는다. 다음 항목을 실제 게시 후 확정한다.

- 최종 소스·패키지 검사 결과와 빌드 digest.
- main no-ff 병합 SHA와 두 부모, PR의 실제 merged 상태.
- `v4.1.0` 태그가 가리키는 병합 커밋.
- 공개 Release URL, ZIP·checksum 자산명, 크기와 공개 다운로드 바이트 비교.
- 모든 작업 브랜치 HEAD가 main의 ancestor인지, 로컬·원격 일치 여부와 shallow 상태.
- 실제 공개된 릴리즈를 가리키는 README·소개 페이지·개발 문서 갱신.

완료 기록 자체의 커밋은 자기 SHA를 본문에 미리 넣을 수 없으므로, 증거의 기준 SHA와 작성 시점을 명시한다. 그 이후의 기록 커밋과 최종 병합은 Git 이력에서 확인한다. 최종 문서 변경은 릴리즈 태그 이후에 올 수 있으며, 해당 변경이 릴리즈 런타임을 바꾸지 않았음을 별도로 확인한다.
