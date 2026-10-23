# 커밋별 작업 원장

기준: `72f08c6927416c45cc0f81bb641b881f5aa2c09c` → `d63fe9e1276c3aeaa562461f47b4ef1cd1e45358`. 커밋 **68개**, 두 부모 이상 병합 **8개**. 생성 시각(UTC): `2026-10-23T04:57:06.382215+00:00`.

Git 객체에서 직접 생성했다. 작성·커밋 시각은 원래 오프셋을 보존하며, 아래 순서는 부모가 먼저 나오는 위상 순서다. 병합 커밋의 파일 목록·증감은 첫 번째 부모와 비교했다. 따라서 여러 행의 줄 수를 합쳐 최종 변경량으로 해석하면 안 된다. 변경 상태는 A=추가, M=수정, D=삭제다. 모든 커밋 제목은 영어 접두사와 한국어 설명 형식으로 검사했다.

이 원장은 명시한 cutoff까지의 스냅샷이며 원장 자신을 게시하는 후속 커밋의 SHA를 미리 포함하지 않는다. 그 이후 커밋·main 병합·릴리즈 결과는 [전체 작업 기록](2026-10-23-liquid-studio.md)과 Git 이력에서 확인한다. [JSON 원본](commits.json)에는 전체 부모 SHA와 모든 경로별 증감이 들어 있다.

## 브랜치 게시 상태

| 브랜치 | 로컬·게시 SHA | 원격 일치 | 스냅샷에 포함 |
| --- | --- | --- | --- |
| `chatgpt/refresh/export/runtime-fixes` | `9ad45ce` | 예 | 예 |
| `chatgpt/refresh/identity` | `42bc5cc` | 예 | 예 |
| `chatgpt/refresh/integration` | `0781aec` | 예 | 예 |
| `chatgpt/refresh/interface` | `1476bfe` | 예 | 예 |
| `chatgpt/refresh/runtime` | `dd4ed45` | 예 | 예 |
| `chatgpt/refresh/studio/lifecycle` | `52c3896` | 예 | 예 |
| `chatgpt/refresh/tooling` | `f3fad74` | 예 | 예 |
| `chatgpt/release/closeout` | `d63fe9e` | 예 | 예 |

## 변경 상세

### 01. docs: 리퀴드 스튜디오 개선 설계와 브랜치 계획 수립

- 커밋: [`1a273bb`](https://github.com/hslcrb/style-scrather/commit/1a273bb011e9272401561def44cac0485a1660af)
- 부모: `72f08c6`
- 작성: `2026-10-23T12:15:57+09:00` · 커밋: `2026-10-23T12:15:57+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/plans/2026-10-23-refresh.md` | 54 | 0 |

### 02. fix: 미리보기 서버 경로 검증과 공개 자산 경계 수정

- 커밋: [`d3fca92`](https://github.com/hslcrb/style-scrather/commit/d3fca926371aa63b249c5cc1afed227370ae82db)
- 부모: `1a273bb`
- 작성: `2026-10-23T12:22:23+09:00` · 커밋: `2026-10-23T12:22:23+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `.gitignore` | 9 | 0 |
| A | `scripts/serve.js` | 75 | 0 |
| M | `serve.js` | 2 | 42 |
| A | `test/server.test.js` | 45 | 0 |

### 03. build: 외부 의존성 없는 확장 패키징과 체크섬 생성 추가

- 커밋: [`cf9def3`](https://github.com/hslcrb/style-scrather/commit/cf9def370e472eb3a7f0984cde88028eaef9b11e)
- 부모: `d3fca92`
- 작성: `2026-10-23T12:25:32+09:00` · 커밋: `2026-10-23T12:25:32+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `scripts/build.js` | 109 | 0 |

### 04. chore: 개발 명령과 구문 검사 및 테스트 실행 체계 추가

- 커밋: [`f6e5dd7`](https://github.com/hslcrb/style-scrather/commit/f6e5dd79d57865c8270d7cc6c9090abd5511211d)
- 부모: `cf9def3`
- 작성: `2026-10-23T12:26:40+09:00` · 커밋: `2026-10-23T12:26:40+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `package-lock.json` | 66 | 0 |
| A | `package.json` | 22 | 0 |
| A | `scripts/check.js` | 28 | 0 |
| A | `scripts/test.js` | 13 | 0 |

### 05. refactor: 누적 릴리즈 기록을 문서 아카이브로 정리

- 커밋: [`d384bd0`](https://github.com/hslcrb/style-scrather/commit/d384bd0c003070661c7c3a140b922b6612913953)
- 부모: `f6e5dd7`
- 작성: `2026-10-23T12:29:13+09:00` · 커밋: `2026-10-23T12:29:13+09:00`
- 변경 파일: 21개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/releases/release-notes-v2.1.0.md` | 45 | 0 |
| A | `docs/releases/release-notes-v2.md` | 50 | 0 |
| A | `docs/releases/release-notes-v3.0.0.md` | 61 | 0 |
| A | `docs/releases/release-notes-v3.0.1.md` | 52 | 0 |
| A | `docs/releases/release-notes-v3.0.2.md` | 45 | 0 |
| A | `docs/releases/release-notes-v4.0.0.md` | 37 | 0 |
| A | `docs/releases/release-notes-v4.0.1.md` | 77 | 0 |
| A | `docs/releases/release-notes-v4.0.2.md` | 85 | 0 |
| A | `docs/releases/release-notes-v4.0.3.md` | 68 | 0 |
| A | `docs/releases/release-notes.md` | 50 | 0 |
| D | `release-notes-v2.1.0.md` | 0 | 45 |
| D | `release-notes-v2.md` | 0 | 50 |
| D | `release-notes-v3.0.0.md` | 0 | 61 |
| D | `release-notes-v3.0.1.md` | 0 | 52 |
| D | `release-notes-v3.0.2.md` | 0 | 45 |
| D | `release-notes-v4.0.0.md` | 0 | 37 |
| D | `release-notes-v4.0.1.md` | 0 | 77 |
| D | `release-notes-v4.0.2.md` | 0 | 85 |
| D | `release-notes-v4.0.3.md` | 0 | 68 |
| D | `release-notes.md` | 0 | 50 |
| M | `test/verify.js` | 1 | 1 |

### 06. docs: 기여 규칙과 보안 제보 및 커뮤니티 기준 정립

- 커밋: [`16d2e29`](https://github.com/hslcrb/style-scrather/commit/16d2e29a2bf25d67f0986026a9ce00215dc408ba)
- 부모: `d384bd0`
- 작성: `2026-10-23T12:29:52+09:00` · 커밋: `2026-10-23T12:29:52+09:00`
- 변경 파일: 3개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `CODE_OF_CONDUCT.md` | 11 | 0 |
| A | `CONTRIBUTING.md` | 57 | 0 |
| A | `SECURITY.md` | 17 | 0 |

### 07. chore: 오류 제보와 개선 제안 및 PR 템플릿 구성

- 커밋: [`fa30559`](https://github.com/hslcrb/style-scrather/commit/fa30559f73a489e5a4d711e71ebc109301400b5a)
- 부모: `16d2e29`
- 작성: `2026-10-23T12:31:51+09:00` · 커밋: `2026-10-23T12:31:51+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `.github/ISSUE_TEMPLATE/bug_report.yml` | 36 | 0 |
| A | `.github/ISSUE_TEMPLATE/config.yml` | 5 | 0 |
| A | `.github/ISSUE_TEMPLATE/feature_request.yml` | 20 | 0 |
| A | `.github/pull_request_template.md` | 19 | 0 |

### 08. feat: 외부 요청 없는 확장 실습 페이지와 상호작용 예제 구성

- 커밋: [`7c84421`](https://github.com/hslcrb/style-scrather/commit/7c84421f111f8dd2a5b625e93ebce4dd3384dd59)
- 부모: `fa30559`
- 작성: `2026-10-23T12:35:03+09:00` · 커밋: `2026-10-23T12:35:03+09:00`
- 변경 파일: 3개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `demo/index.html` | 28 | 728 |
| A | `demo/playground.css` | 1 | 0 |
| A | `demo/playground.js` | 4 | 0 |

### 09. test: 실제 확장 실행과 클릭 복원 및 렌더 횟수 회귀 검사 추가

- 커밋: [`c71de37`](https://github.com/hslcrb/style-scrather/commit/c71de373c150fd1ec6f827f8bf762e005a999ac3)
- 부모: `7c84421`
- 작성: `2026-10-23T12:36:01+09:00` · 커밋: `2026-10-23T12:36:01+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `test/browser.js` | 174 | 0 |

### 10. docs: 런타임 경계와 배포 및 개인정보 처리 문서 작성

- 커밋: [`073f53e`](https://github.com/hslcrb/style-scrather/commit/073f53e9befc546508b791c487ab5248d3b5883b)
- 부모: `c71de37`
- 작성: `2026-10-23T12:42:05+09:00` · 커밋: `2026-10-23T12:42:05+09:00`
- 변경 파일: 3개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/ARCHITECTURE.md` | 77 | 0 |
| A | `docs/DEVELOPMENT.md` | 61 | 0 |
| A | `docs/PRIVACY.md` | 37 | 0 |

### 11. fix: 미리보기 공개 경로 밖의 심볼릭 링크 접근 차단

- 커밋: [`60c39e9`](https://github.com/hslcrb/style-scrather/commit/60c39e916223260d41b5caf1288192787edefe45)
- 부모: `073f53e`
- 작성: `2026-10-23T12:47:38+09:00` · 커밋: `2026-10-23T12:47:38+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `scripts/serve.js` | 9 | 4 |
| M | `test/server.test.js` | 10 | 0 |

### 12. fix: 패키징과 검사에서 공개 스타일 및 와일드카드 자산 검증

- 커밋: [`c25b89b`](https://github.com/hslcrb/style-scrather/commit/c25b89b6269a4d63357c1f8b9c9422abed8120fb)
- 부모: `60c39e9`
- 작성: `2026-10-23T12:49:03+09:00` · 커밋: `2026-10-23T12:49:03+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `scripts/build.js` | 2 | 3 |
| M | `scripts/check.js` | 12 | 7 |
| A | `scripts/manifest-assets.js` | 25 | 0 |
| A | `test/package-assets.test.js` | 50 | 0 |

### 13. docs: 프리뷰 설치와 기능 및 개발 진입 안내 전면 정리

- 커밋: [`a0c0c20`](https://github.com/hslcrb/style-scrather/commit/a0c0c20d98d7838eaad8363828e4eef4b3641e77)
- 부모: `c25b89b`
- 작성: `2026-10-23T12:49:44+09:00` · 커밋: `2026-10-23T12:49:44+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `CONTRIBUTING.md` | 1 | 1 |
| M | `README.md` | 120 | 167 |

### 14. fix(test): 브라우저 주입 인자의 비어 있는 값을 직렬화

- 커밋: [`f3fad74`](https://github.com/hslcrb/style-scrather/commit/f3fad74aa0e63cc47aa0bb99d9f3c51cbb44f5e8)
- 부모: `a0c0c20`
- 작성: `2026-10-23T12:50:09+09:00` · 커밋: `2026-10-23T12:50:09+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `test/browser.js` | 1 | 1 |

### 15. merge: 저장소 체계와 재현 가능한 개발 도구 통합

- 커밋: [`6f00ff1`](https://github.com/hslcrb/style-scrather/commit/6f00ff17c1a83b675c15badbaf63087c80bb299d)
- 부모: `1a273bb`, `f3fad74`
- 작성: `2026-10-23T12:51:13+09:00` · 커밋: `2026-10-23T12:51:13+09:00`
- 변경 파일: 37개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `.github/ISSUE_TEMPLATE/bug_report.yml` | 36 | 0 |
| A | `.github/ISSUE_TEMPLATE/config.yml` | 5 | 0 |
| A | `.github/ISSUE_TEMPLATE/feature_request.yml` | 20 | 0 |
| A | `.github/pull_request_template.md` | 19 | 0 |
| M | `.gitignore` | 9 | 0 |
| A | `CODE_OF_CONDUCT.md` | 11 | 0 |
| A | `CONTRIBUTING.md` | 57 | 0 |
| M | `README.md` | 120 | 167 |
| A | `SECURITY.md` | 17 | 0 |
| M | `demo/index.html` | 28 | 728 |
| A | `demo/playground.css` | 1 | 0 |
| A | `demo/playground.js` | 4 | 0 |
| A | `docs/ARCHITECTURE.md` | 77 | 0 |
| A | `docs/DEVELOPMENT.md` | 61 | 0 |
| A | `docs/PRIVACY.md` | 37 | 0 |
| A | `docs/releases/release-notes-v2.1.0.md` | 45 | 0 |
| A | `docs/releases/release-notes-v2.md` | 50 | 0 |
| A | `docs/releases/release-notes-v3.0.0.md` | 61 | 0 |
| A | `docs/releases/release-notes-v3.0.1.md` | 52 | 0 |
| A | `docs/releases/release-notes-v3.0.2.md` | 45 | 0 |
| A | `docs/releases/release-notes-v4.0.0.md` | 37 | 0 |
| A | `docs/releases/release-notes-v4.0.1.md` | 77 | 0 |
| A | `docs/releases/release-notes-v4.0.2.md` | 85 | 0 |
| A | `docs/releases/release-notes-v4.0.3.md` | 68 | 0 |
| A | `docs/releases/release-notes.md` | 50 | 0 |
| A | `package-lock.json` | 66 | 0 |
| A | `package.json` | 22 | 0 |
| A | `scripts/build.js` | 108 | 0 |
| A | `scripts/check.js` | 33 | 0 |
| A | `scripts/manifest-assets.js` | 25 | 0 |
| A | `scripts/serve.js` | 80 | 0 |
| A | `scripts/test.js` | 13 | 0 |
| M | `serve.js` | 2 | 42 |
| A | `test/browser.js` | 174 | 0 |
| A | `test/package-assets.test.js` | 50 | 0 |
| A | `test/server.test.js` | 55 | 0 |
| M | `test/verify.js` | 1 | 1 |

### 16. feat: 선택 프레임 로고와 스튜디오 브랜드 원칙 정립

- 커밋: [`e54193f`](https://github.com/hslcrb/style-scrather/commit/e54193f4847bfc2ac0452b630cf3c5fad270e671)
- 부모: `1a273bb`
- 작성: `2026-10-23T12:22:06+09:00` · 커밋: `2026-10-23T12:22:06+09:00`
- 변경 파일: 11개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/BRAND.md` | 53 | 0 |
| A | `docs/PHILOSOPHY.md` | 32 | 0 |
| M | `generate-icons.js` | 2 | 146 |
| A | `icons/app-icon.svg` | 1 | 0 |
| M | `icons/icon128.png` | binary | binary |
| M | `icons/icon16.png` | binary | binary |
| M | `icons/icon48.png` | binary | binary |
| A | `icons/mark.svg` | 1 | 0 |
| A | `icons/social-card.svg` | 1 | 0 |
| A | `icons/wordmark.svg` | 1 | 0 |
| A | `scripts/generate-icons.js` | 98 | 0 |

### 17. feat: 실제 CSS 체험을 갖춘 리퀴드 스튜디오 소개 사이트 구현

- 커밋: [`7dd9e9f`](https://github.com/hslcrb/style-scrather/commit/7dd9e9f2b88c33d2ec76e37a418f01b82bc9eb78)
- 부모: `e54193f`
- 작성: `2026-10-23T12:32:17+09:00` · 커밋: `2026-10-23T12:32:17+09:00`
- 변경 파일: 3개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `website/app.js` | 145 | 0 |
| A | `website/index.html` | 94 | 0 |
| A | `website/styles.css` | 11 | 0 |

### 18. fix: 웹 데모 접근성과 복사 상태 및 반응형 가독성 개선

- 커밋: [`a263772`](https://github.com/hslcrb/style-scrather/commit/a263772bdac99c86c95e7d7cc6a5f93f955d621a)
- 부모: `7dd9e9f`
- 작성: `2026-10-23T12:39:21+09:00` · 커밋: `2026-10-23T12:39:21+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `website/README.md` | 29 | 0 |
| M | `website/app.js` | 3 | 3 |
| M | `website/index.html` | 3 | 3 |
| M | `website/styles.css` | 2567 | 10 |

### 19. fix: 정적 사이트 하위 경로에서도 브랜드 자산 유지

- 커밋: [`42bc5cc`](https://github.com/hslcrb/style-scrather/commit/42bc5ccae8202b0079bfbf4d3d6781a1e98f38a2)
- 부모: `a263772`
- 작성: `2026-10-23T12:41:38+09:00` · 커밋: `2026-10-23T12:41:38+09:00`
- 변경 파일: 5개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `docs/BRAND.md` | 1 | 1 |
| M | `scripts/generate-icons.js` | 5 | 1 |
| M | `website/README.md` | 2 | 2 |
| A | `website/icons/mark.svg` | 1 | 0 |
| M | `website/index.html` | 5 | 5 |

### 20. merge: 브랜드 자산과 소개 페이지 및 문서 아카이브 통합

- 커밋: [`94178cf`](https://github.com/hslcrb/style-scrather/commit/94178cfe3290cef21c746034308817ed2c728f1e)
- 부모: `6f00ff1`, `42bc5cc`
- 작성: `2026-10-23T12:52:21+09:00` · 커밋: `2026-10-23T12:52:21+09:00`
- 변경 파일: 26개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/BRAND.md` | 53 | 0 |
| A | `docs/PHILOSOPHY.md` | 32 | 0 |
| M | `generate-icons.js` | 2 | 146 |
| A | `icons/app-icon.svg` | 1 | 0 |
| M | `icons/icon128.png` | binary | binary |
| M | `icons/icon16.png` | binary | binary |
| M | `icons/icon48.png` | binary | binary |
| A | `icons/mark.svg` | 1 | 0 |
| A | `icons/social-card.svg` | 1 | 0 |
| A | `icons/wordmark.svg` | 1 | 0 |
| D | `release-notes-v2.1.0.md` | 0 | 45 |
| D | `release-notes-v2.md` | 0 | 50 |
| D | `release-notes-v3.0.0.md` | 0 | 61 |
| D | `release-notes-v3.0.1.md` | 0 | 52 |
| D | `release-notes-v3.0.2.md` | 0 | 45 |
| D | `release-notes-v4.0.0.md` | 0 | 37 |
| D | `release-notes-v4.0.1.md` | 0 | 77 |
| D | `release-notes-v4.0.2.md` | 0 | 85 |
| D | `release-notes-v4.0.3.md` | 0 | 68 |
| D | `release-notes.md` | 0 | 50 |
| A | `scripts/generate-icons.js` | 102 | 0 |
| A | `website/README.md` | 29 | 0 |
| A | `website/app.js` | 145 | 0 |
| A | `website/icons/mark.svg` | 1 | 0 |
| A | `website/index.html` | 94 | 0 |
| A | `website/styles.css` | 2568 | 0 |

### 21. feat(popup): 액체 유리 화면과 명시적 실행 상태 개선

- 커밋: [`21ed5c1`](https://github.com/hslcrb/style-scrather/commit/21ed5c1244b7259eb899f5e6dabf4f93018da301)
- 부모: `1a273bb`
- 작성: `2026-10-23T12:22:34+09:00` · 커밋: `2026-10-23T12:22:34+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `popup/popup.css` | 87 | 297 |
| M | `popup/popup.html` | 56 | 105 |
| M | `popup/popup.js` | 128 | 177 |
| A | `test/popup.test.js` | 143 | 0 |

### 22. feat(studio): 반응형 유리 스튜디오와 키보드 탐색 재구성

- 커밋: [`1f8c1b4`](https://github.com/hslcrb/style-scrather/commit/1f8c1b4fb86f6dcc45ce22d2c5b1394802bef709)
- 부모: `21ed5c1`
- 작성: `2026-10-23T12:35:03+09:00` · 커밋: `2026-10-23T12:35:03+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/components/floating-dock.js` | 383 | 595 |
| M | `content/styles/shadow-styles.css` | 237 | 1842 |
| A | `test/interface-browser.js` | 100 | 0 |
| A | `test/interface.test.js` | 89 | 0 |

### 23. fix(studio): 페이지 데이터 표시와 비동기 도구 결과 검증

- 커밋: [`1476bfe`](https://github.com/hslcrb/style-scrather/commit/1476bfeda0f3f9868f46c0c54eb4565a5e09100f)
- 부모: `1f8c1b4`
- 작성: `2026-10-23T12:47:01+09:00` · 커밋: `2026-10-23T12:47:01+09:00`
- 변경 파일: 5개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/components/floating-dock.js` | 294 | 664 |
| M | `content/styles/shadow-styles.css` | 6 | 0 |
| M | `popup/popup.html` | 1 | 5 |
| M | `test/interface-browser.js` | 73 | 1 |
| M | `test/interface.test.js` | 51 | 0 |

### 24. merge: 팝업과 반응형 리퀴드 스튜디오 인터페이스 통합

- 커밋: [`5d96745`](https://github.com/hslcrb/style-scrather/commit/5d96745d544439bcb2cf011979e0702f2ef9925c)
- 부모: `94178cf`, `1476bfe`
- 작성: `2026-10-23T12:52:58+09:00` · 커밋: `2026-10-23T12:52:58+09:00`
- 변경 파일: 8개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/components/floating-dock.js` | 674 | 1256 |
| M | `content/styles/shadow-styles.css` | 243 | 1842 |
| M | `popup/popup.css` | 87 | 297 |
| M | `popup/popup.html` | 53 | 106 |
| M | `popup/popup.js` | 128 | 177 |
| A | `test/interface-browser.js` | 172 | 0 |
| A | `test/interface.test.js` | 140 | 0 |
| A | `test/popup.test.js` | 143 | 0 |

### 25. fix: 서비스 워커 폰트 다운로드와 스크립트 주입 복구

- 커밋: [`bd5b13c`](https://github.com/hslcrb/style-scrather/commit/bd5b13ccd0fe35f376a56771719cf6b2174d591e)
- 부모: `1a273bb`
- 작성: `2026-10-23T12:19:52+09:00` · 커밋: `2026-10-23T12:19:52+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `background/service-worker.js` | 68 | 48 |
| A | `test/runtime-background.test.js` | 98 | 0 |

### 26. fix: 검사기를 요청 시 한 번만 초기화

- 커밋: [`f2015a0`](https://github.com/hslcrb/style-scrather/commit/f2015a0d183db5dab32a1635c44b48c836a2ab99)
- 부모: `bd5b13c`
- 작성: `2026-10-23T12:22:06+09:00` · 커밋: `2026-10-23T12:22:06+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/content.js` | 71 | 45 |
| A | `test/runtime-lifecycle.test.js` | 149 | 0 |

### 27. fix: 비활성화 시 페이지 조작과 이벤트를 안전하게 복원

- 커밋: [`60d5608`](https://github.com/hslcrb/style-scrather/commit/60d5608960a62bbb138b48984bbc54c4e1e203c3)
- 부모: `f2015a0`
- 작성: `2026-10-23T12:24:55+09:00` · 커밋: `2026-10-23T12:24:55+09:00`
- 변경 파일: 7개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/content.js` | 1 | 0 |
| M | `content/context-hud.js` | 29 | 12 |
| M | `content/instant-zoom.js` | 58 | 20 |
| M | `content/motion-inspector.js` | 33 | 3 |
| M | `content/page-controller.js` | 23 | 9 |
| M | `content/precision-cursor.js` | 8 | 4 |
| A | `test/runtime-engines.test.js` | 143 | 0 |

### 28. perf: 오버레이 렌더링을 프레임별로 묶고 탭 순서 오류 수정

- 커밋: [`281b21f`](https://github.com/hslcrb/style-scrather/commit/281b21fb1bc5b0957f1da3064319dc7d6d0c7fea)
- 부모: `60d5608`
- 작성: `2026-10-23T12:26:41+09:00` · 커밋: `2026-10-23T12:26:41+09:00`
- 변경 파일: 5개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/content.js` | 9 | 3 |
| M | `content/overlay-canvas.js` | 28 | 4 |
| M | `content/tab-order-visualizer.js` | 20 | 3 |
| M | `content/unit-converter.js` | 2 | 1 |
| M | `test/runtime-engines.test.js` | 36 | 0 |

### 29. fix: 중복 스크립트 주입 시 전역 클래스 충돌 방지

- 커밋: [`a8008f1`](https://github.com/hslcrb/style-scrather/commit/a8008f15e0323f62c9451c6e835c0febc4e7c49d)
- 부모: `281b21f`
- 작성: `2026-10-23T12:28:29+09:00` · 커밋: `2026-10-23T12:28:29+09:00`
- 변경 파일: 23개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/asset-editor.js` | 4 | 0 |
| M | `content/color-suite.js` | 4 | 0 |
| M | `content/context-hud.js` | 4 | 0 |
| M | `content/css-beautifier.js` | 4 | 0 |
| M | `content/device-mockup.js` | 4 | 0 |
| M | `content/font-studio.js` | 4 | 0 |
| M | `content/graphics-inspector.js` | 4 | 0 |
| M | `content/instant-zoom.js` | 4 | 1 |
| M | `content/interaction-detector.js` | 4 | 0 |
| M | `content/mode-manager.js` | 4 | 0 |
| M | `content/motion-inspector.js` | 4 | 0 |
| M | `content/overlay-canvas.js` | 4 | 0 |
| M | `content/page-controller.js` | 4 | 0 |
| M | `content/palette-extractor.js` | 4 | 0 |
| M | `content/precision-cursor.js` | 4 | 0 |
| M | `content/react-exporter.js` | 4 | 0 |
| M | `content/shortcut-manager.js` | 4 | 0 |
| M | `content/style-tweaker.js` | 4 | 0 |
| M | `content/tab-order-visualizer.js` | 4 | 0 |
| M | `content/tailwind-converter.js` | 4 | 0 |
| M | `content/unit-converter.js` | 4 | 0 |
| M | `content/update-guardian.js` | 4 | 0 |
| A | `test/runtime-injection.test.js` | 30 | 0 |

### 30. perf: 업데이트 확인을 공유 캐시와 제한 시간으로 보호

- 커밋: [`3e4bd76`](https://github.com/hslcrb/style-scrather/commit/3e4bd763aca68b71d896c3c199df97e31a48030d)
- 부모: `a8008f1`
- 작성: `2026-10-23T12:30:03+09:00` · 커밋: `2026-10-23T12:30:03+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `background/service-worker.js` | 48 | 0 |
| M | `content/update-guardian.js` | 34 | 39 |
| M | `test/runtime-background.test.js` | 31 | 0 |
| A | `test/runtime-updates.test.js` | 27 | 0 |

### 31. perf: 페이지 스캔 비용을 제한하고 웹폰트 상대 경로 복구

- 커밋: [`1544139`](https://github.com/hslcrb/style-scrather/commit/154413914ce11c1a64ac6ea2db5bb93f1d5da5c4)
- 부모: `3e4bd76`
- 작성: `2026-10-23T12:32:35+09:00` · 커밋: `2026-10-23T12:32:35+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/font-studio.js` | 1 | 1 |
| M | `content/palette-extractor.js` | 47 | 39 |
| M | `content/tab-order-visualizer.js` | 20 | 2 |
| A | `test/runtime-scans.test.js` | 77 | 0 |

### 32. fix: 컨텍스트 메뉴 작업과 누락된 단축키 연결

- 커밋: [`cddb0b2`](https://github.com/hslcrb/style-scrather/commit/cddb0b20c10c04870d703146308da56a5a0a4149)
- 부모: `1544139`
- 작성: `2026-10-23T12:34:52+09:00` · 커밋: `2026-10-23T12:34:52+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/content.js` | 85 | 44 |
| M | `test/runtime-lifecycle.test.js` | 24 | 2 |

### 33. fix: 임시 편집 상태를 복원하고 가짜 글리프 대체 결과 제거

- 커밋: [`a73e2a9`](https://github.com/hslcrb/style-scrather/commit/a73e2a9ad737daf677a4805b14676cb2a38f879d)
- 부모: `cddb0b2`
- 작성: `2026-10-23T12:39:06+09:00` · 커밋: `2026-10-23T12:39:06+09:00`
- 변경 파일: 8개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/asset-editor.js` | 18 | 1 |
| M | `content/content.js` | 1 | 0 |
| M | `content/event-interceptor.js` | 46 | 47 |
| M | `content/font-studio.js` | 10 | 23 |
| M | `content/interaction-detector.js` | 7 | 5 |
| M | `test/runtime-engines.test.js` | 36 | 1 |
| M | `test/runtime-injection.test.js` | 24 | 0 |
| M | `test/runtime-scans.test.js` | 7 | 0 |

### 34. chore: 리퀴드 스튜디오 런타임 버전을 4.1.0으로 갱신

- 커밋: [`9350120`](https://github.com/hslcrb/style-scrather/commit/9350120add300b0389abed85f025e1b392071dbd)
- 부모: `a73e2a9`
- 작성: `2026-10-23T12:40:40+09:00` · 커밋: `2026-10-23T12:40:40+09:00`
- 변경 파일: 3개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `background/service-worker.js` | 2 | 2 |
| M | `content/content.js` | 2 | 2 |
| M | `manifest.json` | 2 | 2 |

### 35. fix: 문자 폭 실측과 실제 글리프 경로 내보내기 구분

- 커밋: [`e88f3e0`](https://github.com/hslcrb/style-scrather/commit/e88f3e0a623415f8d8107ec8b7233d0963922dbe)
- 부모: `9350120`
- 작성: `2026-10-23T12:46:35+09:00` · 커밋: `2026-10-23T12:46:35+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/font-studio.js` | 62 | 88 |
| A | `test/runtime-fonts.test.js` | 51 | 0 |

### 36. fix: 비동기 에셋 다운로드 실패를 HUD에 표시

- 커밋: [`f0eb1de`](https://github.com/hslcrb/style-scrather/commit/f0eb1def5fe855316d2d505071be5ac18f2dd827)
- 부모: `e88f3e0`
- 작성: `2026-10-23T12:50:02+09:00` · 커밋: `2026-10-23T12:50:02+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/content.js` | 1 | 1 |
| M | `test/runtime-lifecycle.test.js` | 17 | 0 |

### 37. fix: 텍스트 아웃라인 SVG의 호스트 입력을 안전하게 직렬화

- 커밋: [`1edd67f`](https://github.com/hslcrb/style-scrather/commit/1edd67fd1f7cd17c4a2d8821175b9aa9c83739e8)
- 부모: `f0eb1de`
- 작성: `2026-10-23T12:53:10+09:00` · 커밋: `2026-10-23T12:53:10+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/font-studio.js` | 8 | 8 |
| M | `test/runtime-fonts.test.js` | 24 | 0 |

### 38. merge: 명시적 실행과 페이지 복원 및 렌더링 개선 통합

- 커밋: [`75f9f50`](https://github.com/hslcrb/style-scrather/commit/75f9f507e932a5d69fbaf2d7f446c16dad98e611)
- 부모: `5d96745`, `1edd67f`
- 작성: `2026-10-23T12:55:01+09:00` · 커밋: `2026-10-23T12:55:01+09:00`
- 변경 파일: 33개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `background/service-worker.js` | 117 | 49 |
| M | `content/asset-editor.js` | 22 | 1 |
| M | `content/color-suite.js` | 4 | 0 |
| M | `content/content.js` | 169 | 94 |
| M | `content/context-hud.js` | 33 | 12 |
| M | `content/css-beautifier.js` | 4 | 0 |
| M | `content/device-mockup.js` | 4 | 0 |
| M | `content/event-interceptor.js` | 46 | 47 |
| M | `content/font-studio.js` | 82 | 117 |
| M | `content/graphics-inspector.js` | 4 | 0 |
| M | `content/instant-zoom.js` | 62 | 21 |
| M | `content/interaction-detector.js` | 11 | 5 |
| M | `content/mode-manager.js` | 4 | 0 |
| M | `content/motion-inspector.js` | 37 | 3 |
| M | `content/overlay-canvas.js` | 32 | 4 |
| M | `content/page-controller.js` | 27 | 9 |
| M | `content/palette-extractor.js` | 51 | 39 |
| M | `content/precision-cursor.js` | 12 | 4 |
| M | `content/react-exporter.js` | 4 | 0 |
| M | `content/shortcut-manager.js` | 4 | 0 |
| M | `content/style-tweaker.js` | 4 | 0 |
| M | `content/tab-order-visualizer.js` | 44 | 5 |
| M | `content/tailwind-converter.js` | 4 | 0 |
| M | `content/unit-converter.js` | 6 | 1 |
| M | `content/update-guardian.js` | 38 | 39 |
| M | `manifest.json` | 2 | 2 |
| A | `test/runtime-background.test.js` | 129 | 0 |
| A | `test/runtime-engines.test.js` | 214 | 0 |
| A | `test/runtime-fonts.test.js` | 75 | 0 |
| A | `test/runtime-injection.test.js` | 54 | 0 |
| A | `test/runtime-lifecycle.test.js` | 188 | 0 |
| A | `test/runtime-scans.test.js` | 84 | 0 |
| A | `test/runtime-updates.test.js` | 27 | 0 |

### 39. test: 고정 UI 문구 대신 실제 엔진 계약으로 호환성 검사 정리

- 커밋: [`57d3405`](https://github.com/hslcrb/style-scrather/commit/57d340505977de77c536fa2e7268acc0019fa6bb)
- 부모: `75f9f50`
- 작성: `2026-10-23T12:56:59+09:00` · 커밋: `2026-10-23T12:56:59+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `test/verify.js` | 28 | 118 |

### 40. fix: JSX 문자열과 HTML 빈 요소를 안전하게 내보내기

- 커밋: [`edc3f8e`](https://github.com/hslcrb/style-scrather/commit/edc3f8ecf85fbc8891125efe47ab292cc679156a)
- 부모: `9350120`
- 작성: `2026-10-23T12:51:40+09:00` · 커밋: `2026-10-23T12:51:40+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/react-exporter.js` | 16 | 11 |
| A | `test/export.test.js` | 57 | 0 |

### 41. fix: 에셋 다운로드의 HTTP 오류와 비동기 실패를 전달

- 커밋: [`9ad45ce`](https://github.com/hslcrb/style-scrather/commit/9ad45ceded54dce745ff005f70edfcb57b11f68c)
- 부모: `edc3f8e`
- 작성: `2026-10-23T12:55:02+09:00` · 커밋: `2026-10-23T12:55:02+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/react-exporter.js` | 10 | 12 |
| M | `test/export.test.js` | 69 | 0 |

### 42. merge: 런타임 하위 브랜치의 코드와 에셋 내보내기 수정 통합

- 커밋: [`7494ea3`](https://github.com/hslcrb/style-scrather/commit/7494ea3de63e00154d1ae7c2649d46ec0e32cf6b)
- 부모: `57d3405`, `9ad45ce`
- 작성: `2026-10-23T12:57:56+09:00` · 커밋: `2026-10-23T12:57:56+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/react-exporter.js` | 26 | 23 |
| A | `test/export.test.js` | 126 | 0 |

### 43. fix: 코드 패널의 에셋 저장을 실제 비동기 API에 연결

- 커밋: [`f482441`](https://github.com/hslcrb/style-scrather/commit/f482441a7ba01f982e28d5a3169bf6761a6736af)
- 부모: `7494ea3`
- 작성: `2026-10-23T12:59:01+09:00` · 커밋: `2026-10-23T12:59:01+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/components/floating-dock.js` | 3 | 3 |
| M | `test/interface.test.js` | 31 | 0 |

### 44. fix: 전역 실행 단축키와 페이지 작업 단축키 설정을 구분

- 커밋: [`0cc2d39`](https://github.com/hslcrb/style-scrather/commit/0cc2d39b2b802fe094601d3b0e213ee1d76dfb22)
- 부모: `f482441`
- 작성: `2026-10-23T13:00:39+09:00` · 커밋: `2026-10-23T13:00:39+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/components/floating-dock.js` | 2 | 2 |

### 45. fix: 스튜디오 종료 시 그리드 표시 상태를 해제

- 커밋: [`dd4ed45`](https://github.com/hslcrb/style-scrather/commit/dd4ed4596f15a7b273ddcdcbba7350c0e8fb7fad)
- 부모: `1edd67f`
- 작성: `2026-10-23T12:58:48+09:00` · 커밋: `2026-10-23T12:58:48+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/content.js` | 2 | 0 |
| M | `test/runtime-lifecycle.test.js` | 18 | 0 |

### 46. merge: 종료 후 그리드와 기준선 상태 정리 수정 통합

- 커밋: [`1f21a98`](https://github.com/hslcrb/style-scrather/commit/1f21a987a378fec1638bb9690adc858126ccdfdf)
- 부모: `0cc2d39`, `dd4ed45`
- 작성: `2026-10-23T13:01:15+09:00` · 커밋: `2026-10-23T13:01:15+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/content.js` | 2 | 0 |
| M | `test/runtime-lifecycle.test.js` | 18 | 0 |

### 47. fix: 글꼴 변경과 탭 이동 뒤에도 문자 폭 측정 결과 유지

- 커밋: [`4d0a528`](https://github.com/hslcrb/style-scrather/commit/4d0a528402979affec0a3a277a4b2521c7ead98c)
- 부모: `1f21a98`
- 작성: `2026-10-23T13:02:26+09:00` · 커밋: `2026-10-23T13:02:26+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/components/floating-dock.js` | 9 | 4 |
| M | `test/interface.test.js` | 41 | 0 |

### 48. test: 실제 브라우저에서 글꼴 내보내기와 전체 임시 상태 복원 검증

- 커밋: [`38b8e72`](https://github.com/hslcrb/style-scrather/commit/38b8e72a6703aaefa34406746364ff0adb0f3326)
- 부모: `4d0a528`
- 작성: `2026-10-23T13:05:32+09:00` · 커밋: `2026-10-23T13:05:32+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `test/browser.js` | 128 | 4 |

### 49. fix(studio): 비활성 상태의 전역 이벤트와 UI 타이머 중지

- 커밋: [`52c3896`](https://github.com/hslcrb/style-scrather/commit/52c389637e0823d2ba4324a51794c0975c0548e3)
- 부모: `f482441`
- 작성: `2026-10-23T13:05:14+09:00` · 커밋: `2026-10-23T13:05:14+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/components/floating-dock.js` | 59 | 10 |
| A | `test/studio-lifecycle.test.js` | 102 | 0 |

### 50. merge: 도크 하위 브랜치의 이벤트와 타이머 수명 관리 통합

- 커밋: [`c149462`](https://github.com/hslcrb/style-scrather/commit/c14946266adcc2086d4823436ec0ab090bbf0087)
- 부모: `38b8e72`, `52c3896`
- 작성: `2026-10-23T13:07:11+09:00` · 커밋: `2026-10-23T13:07:11+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `content/components/floating-dock.js` | 59 | 10 |
| A | `test/studio-lifecycle.test.js` | 102 | 0 |

### 51. ci: 얕은 체크아웃과 실제 확장 브라우저 검증 자동화

- 커밋: [`42153a9`](https://github.com/hslcrb/style-scrather/commit/42153a9353b25333365c3af9dea959ac1f2e3e52)
- 부모: `c149462`
- 작성: `2026-10-23T13:08:01+09:00` · 커밋: `2026-10-23T13:08:01+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `.github/workflows/verify.yml` | 34 | 0 |

### 52. style: 기존 버전 표기 규칙과 문자 폭 기능 설명을 일치

- 커밋: [`9bf9db5`](https://github.com/hslcrb/style-scrather/commit/9bf9db55e2744bbe74b71f084d5913e4d5b6ce3c)
- 부모: `42153a9`
- 작성: `2026-10-23T13:09:47+09:00` · 커밋: `2026-10-23T13:09:47+09:00`
- 변경 파일: 4개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `README.md` | 1 | 1 |
| M | `content/components/floating-dock.js` | 3 | 3 |
| M | `popup/popup.html` | 1 | 1 |
| M | `popup/popup.js` | 1 | 1 |

### 53. test: 동일 페이지에서 전후 렌더 횟수를 재현하는 측정 도구 추가

- 커밋: [`2c55afd`](https://github.com/hslcrb/style-scrather/commit/2c55afd6aa892dd999667a5ce886b6e6e2085732)
- 부모: `9bf9db5`
- 작성: `2026-10-23T13:13:18+09:00` · 커밋: `2026-10-23T13:13:18+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `package.json` | 12 | 4 |
| A | `test/benchmark.js` | 70 | 0 |

### 54. docs: 리퀴드 스튜디오 프리뷰 변경 이력과 개발 안내 완성

- 커밋: [`ee91b17`](https://github.com/hslcrb/style-scrather/commit/ee91b17b03de64409d6f8928a2a1862e530773bd)
- 부모: `2c55afd`
- 작성: `2026-10-23T13:16:42+09:00` · 커밋: `2026-10-23T13:16:42+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `CHANGELOG.md` | 55 | 0 |
| M | `docs/DEVELOPMENT.md` | 5 | 0 |

### 55. docs: 실제 브라우저와 패키지 검증 근거 및 CI 제한 기록

- 커밋: [`8f05ffd`](https://github.com/hslcrb/style-scrather/commit/8f05ffdd9d10aa1c9d99a07cd4129e453f6d4bbd)
- 부모: `ee91b17`
- 작성: `2026-10-23T13:18:09+09:00` · 커밋: `2026-10-23T13:18:09+09:00`
- 변경 파일: 7개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/VERIFICATION.md` | 116 | 0 |
| A | `docs/verification/benchmark-after.json` | 20 | 0 |
| A | `docs/verification/benchmark-before.json` | 19 | 0 |
| A | `docs/verification/browser-packaged.json` | 27 | 0 |
| A | `docs/verification/browser-source.json` | 28 | 0 |
| A | `docs/verification/ci-status.json` | 11 | 0 |
| A | `docs/verification/package.json` | 11 | 0 |

### 56. docs: 실제 스튜디오와 소개 페이지 화면을 README에 반영

- 커밋: [`6dcab28`](https://github.com/hslcrb/style-scrather/commit/6dcab289e2fcce7e4c69fa42357cc5cb1d83402e)
- 부모: `8f05ffd`
- 작성: `2026-10-23T13:19:23+09:00` · 커밋: `2026-10-23T13:19:23+09:00`
- 변경 파일: 3개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `README.md` | 1 | 1 |
| A | `docs/assets/studio-desktop.png` | binary | binary |
| A | `docs/assets/website-hero.png` | binary | binary |

### 57. docs: 완료된 브랜치 작업과 검증 결과를 계획에 반영

- 커밋: [`8c0ba8d`](https://github.com/hslcrb/style-scrather/commit/8c0ba8d8ab56c466d4a27249e69a500d476c8c9d)
- 부모: `6dcab28`
- 작성: `2026-10-23T13:21:02+09:00` · 커밋: `2026-10-23T13:21:02+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `docs/plans/2026-10-23-refresh.md` | 12 | 8 |

### 58. docs: PR 검토 링크와 얕은 체크아웃 완료 상태 기록

- 커밋: [`dfe954e`](https://github.com/hslcrb/style-scrather/commit/dfe954ec436065bea09fab4cf5ba3c65fcee91c8)
- 부모: `8c0ba8d`
- 작성: `2026-10-23T13:23:57+09:00` · 커밋: `2026-10-23T13:23:57+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `.github/pull_request_template.md` | 0 | 1 |
| M | `docs/plans/2026-10-23-refresh.md` | 5 | 1 |

### 59. ci: 워크플로를 전체 주석 처리하고 임시 비활성화

- 커밋: [`e8db293`](https://github.com/hslcrb/style-scrather/commit/e8db293eae744c7c7161dfab6ca3239e3a83f0df)
- 부모: `dfe954e`
- 작성: `2026-10-23T13:32:24+09:00` · 커밋: `2026-10-23T13:32:24+09:00`
- 변경 파일: 3개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `.github/workflows/README.md` | 20 | 0 |
| D | `.github/workflows/verify.yml` | 0 | 34 |
| A | `.github/workflows/verify.yml.disabled` | 38 | 0 |

### 60. docs: 로컬 검증과 no-ff 병합 및 수동 릴리즈 절차 정립

- 커밋: [`6eecbc4`](https://github.com/hslcrb/style-scrather/commit/6eecbc41553873a4cb0034b8ca8a41e0df9ebace)
- 부모: `e8db293`
- 작성: `2026-10-23T13:34:21+09:00` · 커밋: `2026-10-23T13:34:21+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `docs/DEVELOPMENT.md` | 4 | 2 |
| A | `docs/RELEASING.md` | 63 | 0 |

### 61. docs: 조사부터 통합과 검증까지 전체 개선 과정을 상세 기록

- 커밋: [`7e06994`](https://github.com/hslcrb/style-scrather/commit/7e069940fcea8e623dea7f54d3c6d837cb44bebd)
- 부모: `6eecbc4`
- 작성: `2026-10-23T13:37:54+09:00` · 커밋: `2026-10-23T13:37:54+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/process/2026-10-23-liquid-studio.md` | 218 | 0 |

### 62. docs: 커밋별 변경 파일과 부모 관계 및 게시 상태 원장 추가

- 커밋: [`144e997`](https://github.com/hslcrb/style-scrather/commit/144e9970289ec769eee8af682d51952a2d058462)
- 부모: `7e06994`
- 작성: `2026-10-23T13:39:22+09:00` · 커밋: `2026-10-23T13:39:22+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/process/COMMITS.md` | 941 | 0 |
| A | `docs/process/commits.json` | 2595 | 0 |

### 63. docs: 로컬 빌드 근거와 설치 안내를 포함한 4.1.0 릴리즈 노트 작성

- 커밋: [`0b7f478`](https://github.com/hslcrb/style-scrather/commit/0b7f4788d035f01de4c491fb4b63bc751e8f9d7d)
- 부모: `144e997`
- 작성: `2026-10-23T13:40:59+09:00` · 커밋: `2026-10-23T13:40:59+09:00`
- 변경 파일: 1개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/releases/release-notes-v4.1.0.md` | 65 | 0 |

### 64. docs: 릴리즈 직전 실제 브라우저와 반복 빌드 검증 증거 고정

- 커밋: [`0781aec`](https://github.com/hslcrb/style-scrather/commit/0781aec39814aac02700efe5e43ef4dc971a13ae)
- 부모: `0b7f478`
- 작성: `2026-10-23T13:43:16+09:00` · 커밋: `2026-10-23T13:43:16+09:00`
- 변경 파일: 5개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `docs/VERIFICATION.md` | 17 | 2 |
| M | `docs/process/2026-10-23-liquid-studio.md` | 1 | 1 |
| A | `docs/verification/release-browser-packaged.json` | 27 | 0 |
| A | `docs/verification/release-browser-source.json` | 28 | 0 |
| A | `docs/verification/release-local.json` | 344 | 0 |

### 65. merge: 리퀴드 스튜디오 개선과 로컬 릴리즈 검증을 메인에 통합

- 커밋: [`19c088f`](https://github.com/hslcrb/style-scrather/commit/19c088f61d33fca8e62c7f8d329f4b33aaa58aba)
- 부모: `72f08c6`, `0781aec`
- 작성: `2026-10-23T13:44:22+09:00` · 커밋: `2026-10-23T13:44:22+09:00`
- 변경 파일: 128개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `.github/ISSUE_TEMPLATE/bug_report.yml` | 36 | 0 |
| A | `.github/ISSUE_TEMPLATE/config.yml` | 5 | 0 |
| A | `.github/ISSUE_TEMPLATE/feature_request.yml` | 20 | 0 |
| A | `.github/pull_request_template.md` | 18 | 0 |
| A | `.github/workflows/README.md` | 20 | 0 |
| A | `.github/workflows/verify.yml.disabled` | 38 | 0 |
| M | `.gitignore` | 9 | 0 |
| A | `CHANGELOG.md` | 55 | 0 |
| A | `CODE_OF_CONDUCT.md` | 11 | 0 |
| A | `CONTRIBUTING.md` | 57 | 0 |
| M | `README.md` | 120 | 167 |
| A | `SECURITY.md` | 17 | 0 |
| M | `background/service-worker.js` | 117 | 49 |
| M | `content/asset-editor.js` | 22 | 1 |
| M | `content/color-suite.js` | 4 | 0 |
| M | `content/components/floating-dock.js` | 729 | 1257 |
| M | `content/content.js` | 171 | 94 |
| M | `content/context-hud.js` | 33 | 12 |
| M | `content/css-beautifier.js` | 4 | 0 |
| M | `content/device-mockup.js` | 4 | 0 |
| M | `content/event-interceptor.js` | 46 | 47 |
| M | `content/font-studio.js` | 82 | 117 |
| M | `content/graphics-inspector.js` | 4 | 0 |
| M | `content/instant-zoom.js` | 62 | 21 |
| M | `content/interaction-detector.js` | 11 | 5 |
| M | `content/mode-manager.js` | 4 | 0 |
| M | `content/motion-inspector.js` | 37 | 3 |
| M | `content/overlay-canvas.js` | 32 | 4 |
| M | `content/page-controller.js` | 27 | 9 |
| M | `content/palette-extractor.js` | 51 | 39 |
| M | `content/precision-cursor.js` | 12 | 4 |
| M | `content/react-exporter.js` | 30 | 23 |
| M | `content/shortcut-manager.js` | 4 | 0 |
| M | `content/style-tweaker.js` | 4 | 0 |
| M | `content/styles/shadow-styles.css` | 243 | 1842 |
| M | `content/tab-order-visualizer.js` | 44 | 5 |
| M | `content/tailwind-converter.js` | 4 | 0 |
| M | `content/unit-converter.js` | 6 | 1 |
| M | `content/update-guardian.js` | 38 | 39 |
| M | `demo/index.html` | 28 | 728 |
| A | `demo/playground.css` | 1 | 0 |
| A | `demo/playground.js` | 4 | 0 |
| A | `docs/ARCHITECTURE.md` | 77 | 0 |
| A | `docs/BRAND.md` | 53 | 0 |
| A | `docs/DEVELOPMENT.md` | 68 | 0 |
| A | `docs/PHILOSOPHY.md` | 32 | 0 |
| A | `docs/PRIVACY.md` | 37 | 0 |
| A | `docs/RELEASING.md` | 63 | 0 |
| A | `docs/VERIFICATION.md` | 131 | 0 |
| A | `docs/assets/studio-desktop.png` | binary | binary |
| A | `docs/assets/website-hero.png` | binary | binary |
| A | `docs/plans/2026-10-23-refresh.md` | 62 | 0 |
| A | `docs/process/2026-10-23-liquid-studio.md` | 218 | 0 |
| A | `docs/process/COMMITS.md` | 941 | 0 |
| A | `docs/process/commits.json` | 2595 | 0 |
| A | `docs/releases/release-notes-v2.1.0.md` | 45 | 0 |
| A | `docs/releases/release-notes-v2.md` | 50 | 0 |
| A | `docs/releases/release-notes-v3.0.0.md` | 61 | 0 |
| A | `docs/releases/release-notes-v3.0.1.md` | 52 | 0 |
| A | `docs/releases/release-notes-v3.0.2.md` | 45 | 0 |
| A | `docs/releases/release-notes-v4.0.0.md` | 37 | 0 |
| A | `docs/releases/release-notes-v4.0.1.md` | 77 | 0 |
| A | `docs/releases/release-notes-v4.0.2.md` | 85 | 0 |
| A | `docs/releases/release-notes-v4.0.3.md` | 68 | 0 |
| A | `docs/releases/release-notes-v4.1.0.md` | 65 | 0 |
| A | `docs/releases/release-notes.md` | 50 | 0 |
| A | `docs/verification/benchmark-after.json` | 20 | 0 |
| A | `docs/verification/benchmark-before.json` | 19 | 0 |
| A | `docs/verification/browser-packaged.json` | 27 | 0 |
| A | `docs/verification/browser-source.json` | 28 | 0 |
| A | `docs/verification/ci-status.json` | 11 | 0 |
| A | `docs/verification/package.json` | 11 | 0 |
| A | `docs/verification/release-browser-packaged.json` | 27 | 0 |
| A | `docs/verification/release-browser-source.json` | 28 | 0 |
| A | `docs/verification/release-local.json` | 344 | 0 |
| M | `generate-icons.js` | 2 | 146 |
| A | `icons/app-icon.svg` | 1 | 0 |
| M | `icons/icon128.png` | binary | binary |
| M | `icons/icon16.png` | binary | binary |
| M | `icons/icon48.png` | binary | binary |
| A | `icons/mark.svg` | 1 | 0 |
| A | `icons/social-card.svg` | 1 | 0 |
| A | `icons/wordmark.svg` | 1 | 0 |
| M | `manifest.json` | 2 | 2 |
| A | `package-lock.json` | 66 | 0 |
| A | `package.json` | 30 | 0 |
| M | `popup/popup.css` | 87 | 297 |
| M | `popup/popup.html` | 53 | 106 |
| M | `popup/popup.js` | 128 | 177 |
| D | `release-notes-v2.1.0.md` | 0 | 45 |
| D | `release-notes-v2.md` | 0 | 50 |
| D | `release-notes-v3.0.0.md` | 0 | 61 |
| D | `release-notes-v3.0.1.md` | 0 | 52 |
| D | `release-notes-v3.0.2.md` | 0 | 45 |
| D | `release-notes-v4.0.0.md` | 0 | 37 |
| D | `release-notes-v4.0.1.md` | 0 | 77 |
| D | `release-notes-v4.0.2.md` | 0 | 85 |
| D | `release-notes-v4.0.3.md` | 0 | 68 |
| D | `release-notes.md` | 0 | 50 |
| A | `scripts/build.js` | 108 | 0 |
| A | `scripts/check.js` | 33 | 0 |
| A | `scripts/generate-icons.js` | 102 | 0 |
| A | `scripts/manifest-assets.js` | 25 | 0 |
| A | `scripts/serve.js` | 80 | 0 |
| A | `scripts/test.js` | 13 | 0 |
| M | `serve.js` | 2 | 42 |
| A | `test/benchmark.js` | 70 | 0 |
| A | `test/browser.js` | 298 | 0 |
| A | `test/export.test.js` | 126 | 0 |
| A | `test/interface-browser.js` | 172 | 0 |
| A | `test/interface.test.js` | 212 | 0 |
| A | `test/package-assets.test.js` | 50 | 0 |
| A | `test/popup.test.js` | 143 | 0 |
| A | `test/runtime-background.test.js` | 129 | 0 |
| A | `test/runtime-engines.test.js` | 214 | 0 |
| A | `test/runtime-fonts.test.js` | 75 | 0 |
| A | `test/runtime-injection.test.js` | 54 | 0 |
| A | `test/runtime-lifecycle.test.js` | 206 | 0 |
| A | `test/runtime-scans.test.js` | 84 | 0 |
| A | `test/runtime-updates.test.js` | 27 | 0 |
| A | `test/server.test.js` | 55 | 0 |
| A | `test/studio-lifecycle.test.js` | 102 | 0 |
| M | `test/verify.js` | 29 | 119 |
| A | `website/README.md` | 29 | 0 |
| A | `website/app.js` | 145 | 0 |
| A | `website/icons/mark.svg` | 1 | 0 |
| A | `website/index.html` | 94 | 0 |
| A | `website/styles.css` | 2568 | 0 |

### 66. docs: 정식 릴리즈 게시와 공개 다운로드 무결성 확인 기록

- 커밋: [`9158c19`](https://github.com/hslcrb/style-scrather/commit/9158c19f6b3e68c14f269e90a8a1c39e3e93dd12)
- 부모: `19c088f`
- 작성: `2026-10-23T13:52:46+09:00` · 커밋: `2026-10-23T13:52:46+09:00`
- 변경 파일: 3개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| A | `docs/assets/release-v4.1.0-20261023.jpg` | binary | binary |
| M | `docs/process/2026-10-23-liquid-studio.md` | 27 | 9 |
| A | `docs/verification/release-published.json` | 57 | 0 |

### 67. docs: 정식 릴리즈 설치와 메인 기준 기여 및 완료 안내 갱신

- 커밋: [`c510df2`](https://github.com/hslcrb/style-scrather/commit/c510df248e39d7075d259aba09e89bda093227e7)
- 부모: `9158c19`
- 작성: `2026-10-23T13:54:25+09:00` · 커밋: `2026-10-23T13:54:25+09:00`
- 변경 파일: 7개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `CHANGELOG.md` | 6 | 5 |
| M | `CONTRIBUTING.md` | 3 | 3 |
| M | `README.md` | 19 | 13 |
| M | `docs/BRAND.md` | 1 | 1 |
| M | `docs/DEVELOPMENT.md` | 1 | 1 |
| M | `docs/VERIFICATION.md` | 5 | 1 |
| M | `docs/plans/2026-10-23-refresh.md` | 10 | 2 |

### 68. docs(site): 소개 페이지를 검증된 정식 설치 파일과 메인 문서에 연결

- 커밋: [`d63fe9e`](https://github.com/hslcrb/style-scrather/commit/d63fe9e1276c3aeaa562461f47b4ef1cd1e45358)
- 부모: `c510df2`
- 작성: `2026-10-23T13:55:16+09:00` · 커밋: `2026-10-23T13:55:16+09:00`
- 변경 파일: 2개

| 상태 | 경로 | 추가 | 삭제 |
| --- | --- | ---: | ---: |
| M | `website/README.md` | 3 | 3 |
| M | `website/index.html` | 9 | 9 |

