# Verification · v4.1.0. preview

검증일: **2026-10-23**. 이 문서는 확인한 동작과 확인하지 못한 환경을 구분합니다. 모든 웹사이트에서 모든 오류가 없다는 선언은 아닙니다.

## Environment and source

| 항목 | 실제 검증 환경 |
| --- | --- |
| OS | Linux |
| Node.js | 24.19.0 |
| Playwright | 1.62.1, 개발 의존성 |
| 설치 브라우저 | Chrome for Testing 156.0.8078.47, headless persistent profile |
| 화면 | 1440 × 1000; 도크 390px·320px; 소개 페이지 768px·390px·320px |
| 기존 버전 | `72f08c6927416c45cc0f81bb641b881f5aa2c09c`, v4.0.3. |
| 검증한 런타임 | `9bf9db55e2744bbe74b71f084d5913e4d5b6ce3c`, v4.1.0. |
| 후속 변경 | 동일 런타임 위에 측정 도구·문서·검증 자료 추가 |

브라우저는 개인 프로필을 사용하지 않습니다. 임시 프로필에 실제 Manifest V3 확장을 로드하고 테스트 종료 시 정리합니다. 한글 스크린샷에는 검증 환경의 Noto Sans KR을 사용했습니다. 제품은 시스템 글꼴 대체 목록을 사용하며 해당 폰트를 다운로드하지 않습니다.

## Results

| 검사 | 결과 |
| --- | --- |
| `npm ci --ignore-scripts` | 잠금 파일에서 설치 성공 |
| `npm run check` | JavaScript 구문, 버전 일치, manifest 자산 참조 통과 |
| `npm test` | **14개 실행 파일 통과**: 78개 동작 회귀 사례 + 엔진 호환성 검사 |
| 원본 폴더의 실제 확장 | **13개 통합 시나리오 통과**, page error 0 |
| 배포 폴더의 실제 확장 | **12개 확장 시나리오 통과**, page error 0; 소개 페이지는 패키지에서 제외 |
| `node test/interface-browser.js` | 10개 패널, 키보드, 작은 화면, 편집, 실패 상태, reduced motion 통과 |
| ZIP 독립 검사 | Python `zipfile.testzip()` CRC 통과; 압축 내부와 unpacked 폴더 바이트 일치 |
| 재현 가능성 | 같은 소스로 두 번 생성한 ZIP의 SHA-256 동일; 브랜드 자산 8개 재생성 결과 동일 |
| GitHub Actions | 워크플로 등록 성공. **계정 billing lock으로 runner가 시작되지 않아 원격 통과 여부는 미확인** |

Node 동작 검사 구성: exporter 9, interface 12, package assets 3, popup 8, background 7, engines 12, fonts 6, injection 2, runtime lifecycle 10, bounded scans 4, updates 1, server 1, studio lifecycle 3. 기존 검사에서 고정 버전·CSS 문자열·가짜 Canvas 결과를 요구하던 부분은 실제 계약 검사로 바꾸었습니다.

### 실제 설치 확장에서 확인한 동작

1. 처음에는 비활성 상태이고 도크 DOM이 없으며 일반 페이지 클릭이 정상 동작합니다.
2. 명시적으로 켠 뒤 요소를 선택하고 CSS를 변경·복원할 수 있습니다.
3. 실제 선택 요소로 모든 패널이 렌더링됩니다.
4. 같은 요소의 이동 이벤트를 프레임 단위로 묶어 그립니다.
5. manifest 전체를 다시 주입해도 호스트가 중복되지 않습니다.
6. 도크가 390px·320px 창을 벗어나지 않습니다.
7. 실제 확장 팝업이 현재 탭 상태를 읽고 종료 결과를 확인합니다.
8. 종료 후 일반 클릭이 돌아오고 오버레이 그리기가 멈춥니다.
9. 실제 Canvas 픽셀로 서로 다른 SVG 경로가 생성되며 특수문자·글꼴명·색상 값이 XML 구조를 변조하지 않습니다.
10. 글꼴 변경 후 현재 글꼴로 폭을 측정하고, 진행 중 다른 탭으로 옮겨도 결과를 잃지 않습니다. 지원률을 주장하지 않습니다.
11. 코드 패널에서 요청한 PNG 다운로드가 원본 바이트와 같습니다.
12. 종료 시 줌의 CSS 값과 `!important`, 이벤트 핸들러, 동결, 커서, 탭 순서, 그리드, 기준선, 애니메이션 속도와 기존 일시정지 상태를 복원합니다.
13. 소개 페이지가 루트 경로에서 열리고 작은 화면에서 가로로 넘치지 않습니다.

추가 UI 검사는 긴 페이지 문자열, HTML처럼 보이는 텍스트, 클립보드 거절, 폰트/CSS/업데이트 실패, 입력 포커스와 펼침 상태 유지, 메뉴 Escape 동작을 포함합니다. 정적 소개 페이지는 JavaScript 비활성 상태와 상대 경로 배포도 확인했습니다.

## Controlled paint-count comparison

`test/benchmark.js`는 **동일한 HTML fixture**, 브라우저 버전, 1440 × 1000 창과 임시 프로필 조건으로 두 버전을 실행합니다. 헤딩의 같은 좌표에 `mousemove` 240개를 한 동기 작업에서 전달하고 두 animation frame 뒤 실제 그리기 호출을 셉니다. 기존 버전은 `render`, 개선본은 실제 페인트 함수 `renderNow`를 계측합니다.

| 관측값 | v4.0.3. | v4.1.0. |
| --- | ---: | ---: |
| 요청 전 활성 상태 | 켜짐 | 꺼짐 |
| 요청 전 도크 호스트 | 1 | 0 |
| 요청 전 버튼 한 번 클릭 | `Clicks: 0` | `Clicks: 1` |
| 입력 이벤트 | 240 | 240 |
| 실제 오버레이 그리기 | 240 | 1 |
| page error | 0 | 0 |

이 조건에서 페인트 호출은 약 **99.6% 감소**했습니다. 이는 한 프레임 전의 중복 작업을 줄인 결과입니다. 전체 사이트 로딩 시간, CPU 사용량, 메모리, FPS 또는 실제 사용자 세션 전체가 같은 비율로 좋아졌다는 뜻은 아닙니다. 서로 다른 요소로 이동하거나 프레임마다 이벤트가 오면 그리기 횟수도 달라집니다.

```sh
npm ci
npx playwright install chromium
npm run benchmark

# 같은 측정 도구로 별도의 기존 소스 폴더를 검사
EXTENSION_UNDER_TEST=/path/to/v4.0.3 \
BENCHMARK_OUTPUT=test-results/before.json npm run benchmark
```

기존 소스의 commit은 위 표에 고정했습니다. `CHROMIUM_EXECUTABLE`로 동일한 전체 Chromium/Chrome for Testing 실행 파일을 지정할 수 있습니다.

## Package evidence

검증된 ZIP은 runtime 파일 **39개**, **114,504 bytes**입니다. `manifest.json`이 압축 루트에 있고 문서·테스트·개발 의존성·웹사이트는 포함하지 않습니다.

```text
d1b8773cd276587adce6fa5b338d23c3a9b10ced4295d5c70e3d5bf648df6849
```

위 SHA-256은 이 문서에 기록한 런타임의 `style-scratcher-4.1.0.zip`입니다. 후속 runtime/아이콘 변경 시 다시 빌드하고 기록을 갱신해야 합니다.

## Hosted CI limitation

[GitHub Actions 실행 기록](https://github.com/hslcrb/style-scrather/actions/runs/39898695046)은 runner가 배정되기 전에 실패했습니다. 실제 annotation은 다음과 같습니다.

> The job was not started because your account is locked due to a billing issue.

실행 단계와 로그가 생성되지 않았으므로 원격 테스트 실패로 분류하지도, 원격 테스트 통과로 표시하지도 않습니다. 저장소 소유자가 계정 billing 제한을 해결한 뒤 `Verify`를 다시 실행해야 합니다. 워크플로는 얕은 checkout, 읽기 전용 권한, 고정 action commit, 중복 실행 취소, Node 22 및 실제 Chromium 검사를 구성했습니다. 계정 결제·권한 설정은 변경하지 않았습니다.

## Evidence files

- [원본 확장 브라우저 결과](verification/browser-source.json)
- [패키지 확장 브라우저 결과](verification/browser-packaged.json)
- [통제된 이전 버전 측정](verification/benchmark-before.json)
- [통제된 개선 버전 측정](verification/benchmark-after.json)
- [ZIP·브랜드 재현 검사](verification/package.json)
- [원격 CI 시작 제한](verification/ci-status.json)
- [실제 스튜디오 화면](assets/studio-desktop.png) · [소개 페이지](assets/website-hero.png)

## Not verified or intentionally limited

- Windows/macOS의 실제 설치 절차, Chrome Web Store 심사, Firefox·Safari 호환성은 검증하지 않았습니다.
- 모든 웹사이트·iframe·닫힌 Shadow DOM·인증된 외부 폰트 서버를 포괄하지 않습니다.
- blur 미지원 브라우저와 모든 보조 기술 조합을 실제 장치에서 검증하지 않았습니다. fallback·forced-colors 스타일은 코드에 포함했습니다.
- 시스템 글꼴에 따라 텍스트 치수와 Canvas 윤곽이 달라질 수 있습니다. 측정값은 폰트 내부 글리프 존재 여부를 증명하지 않습니다.
- 라이브 텍스트·이미지·DOM 편집은 현재 페이지의 실험입니다. 원본 앱 전체를 되돌리는 undo 이력은 제공하지 않으며, 새로고침으로 초기화할 수 있습니다.
- 이 브랜치는 프리뷰이며 새 정식 릴리즈나 공개 호스팅 주소를 만들지 않습니다.
