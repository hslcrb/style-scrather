# Style Scratcher v4.0.3. - True Vector Outliner & WebFont Engine Release

디자이너와 프론트엔드 개발자를 위한 화이트 미니멀 피그마 감성 웹 인스펙터 & 에디트 스튜디오 **Style Scratcher v4.0.3.** 정식 릴리즈입니다.

---

## 🏷️ 엄격한 끝 마침표 버전 체계 (Strict Dot Version Standard)
Style Scratcher는 버전의 명확성과 일관성을 위해 **반드시 끝에 마침표(dot)를 포함하는 `vX.Y.Z.` 규격**을 엄격히 준수합니다:
- **표준 표기 형식**: `v` + `Major` + `.` + `Minor` + `.` + `Patch` + `.` (예: **`v4.0.3.`**, **`v1.1.1.`**)
- **Major (4)**: 풀 스튜디오 메이저 아키텍처 (검사/편집 분리, 목업, 폰트 스튜디오, Hug/Fill/Fixed 감지, W3C 탭 순서, 스마트 HUD, React JSX)
- **Minor (0)**: 안정화 및 핵심 모듈 패키지
- **Patch (3)**: **서브픽셀 마칭 스퀘어 트루 벡터 글리프 아웃라이너, 웹폰트 바이너리 다운로더, W3C SVG 폰트 빌더, 병렬 글리프 실측 수확기**

---

## 🎨 공식 브랜드 컬러 (Official Brand Color Specification)
Style Scratcher의 정체성과 디자인 일관성을 보장하기 위해 **공식 브랜드 컬러 시스템**을 준수합니다:
- **Primary Brand Accent**: `#E11D48` (Studio Crimson / Rose 600)
- **Hover Accent**: `#BE123C` (Rose 700)
- **Active / Dark Accent**: `#9F1239` (Rose 800)
- **Subtle Background Tint**: `#FFF1F2` (Rose 50)
- **Subtle Border**: `#FFE4E6` / `#FECDD3`
- **Focus Ring & Glow**: `rgba(225, 29, 72, 0.15)`

---

## 🚀 v4.0.3. 핵심 신규 기능 (What's New in v4.0.3.)

### 1. 서브픽셀 마칭 스퀘어 트루 벡터 아웃라이너 (True Vector Glyph Outliner)
- 외부 무거운 라이브러리 없이 순수 Canvas 2D 2x 슈퍼샘플링 및 **서브픽셀 선형보간 마칭 스퀘어(Marching Squares) + RDP 곡선 단순화 + `fill-rule="evenodd"`** 엔진 자체 구현.
- 단순 `<text>` 껍데기가 아닌, 폰트가 설치되어 있지 않은 환경에서도 피그마나 일러스트레이터에서 100% 벡터 곡선 도형(Curves)으로 유지되는 진짜 `<path d="M... Z" fill-rule="evenodd" />` 벡터 패스 생성.
- 원클릭 **벡터 아웃라인 클립보드 복사** 및 **`.svg` 파일 즉시 다운로드** 지원.

### 2. 웹폰트 바이너리(WOFF2/WOFF/TTF) 원클릭 다운로더 & CORS 가디언
- 웹페이지에 로드된 `@font-face` URL 및 Base64 Data URI를 감지하여 실제 폰트 파일(`.woff2`, `.woff`, `.ttf`)로 브라우저 로컬 저장.
- 외부 CDN의 엄격한 CORS 제한을 우회하기 위해 백그라운드 서비스 워커의 `FETCH_FONT_BUFFER` 프록시 탑재.
- Google Fonts CSS API에서 실제 최신 WOFF2 파일 다운로드 URL 자동 추출.

### 3. 수확된 글리프의 W3C SVG 폰트 파일 재구성 (Re-assemble into SVG Font)
- 아웃라인화된 각 글리프의 유니코드 헥스와 벡터 패스 데이터를 조합하여 정식 W3C SVG 폰트 규격(`<svg><font><glyph .../></font></svg>`)으로 패키징.
- 단일 `.svg` 폰트 파일로 다운로드하여 Figma, Illustrator, IcoMoon 등에 폰트 에셋으로 즉시 재임포트 가능.

### 4. 실측형 병렬 글리프 커버리지 검사기 (Real Glyph Coverage Scanner)
- Canvas 2D 폰트 메트릭스 및 기본 Fallback 폰트(`monospace`)의 너비/렌더링 차이를 실시간 비교하여, 해당 웹폰트가 한글 2350자 완성형 및 라틴 특수기호를 실제로 지원하는지(Missing Glyph / `.notdef` 검출) 정밀 측정.
- 비동기 논블로킹 60fps 배치 처리로 브라우저 렉 없이 실제 커버리지 비율(`coveragePct`)과 지원 현황 보고.

---

## 📦 Chrome 브라우저 설치 및 업데이트 방법

1. 아래 **Assets**에서 `style-scrather-v4.0.3.zip`을 다운로드합니다 (기존 사용자는 플로팅 독 알림 배너의 **원클릭 업데이트**로 즉시 다운로드 가능).
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저에서 `chrome://extensions` 에 접속합니다.
4. 우측 상단의 **'개발자 모드 (Developer mode)'**를 활성화합니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭하고 압축 해제한 폴더를 선택합니다 (기존 사용자는 새로고침 아이콘 클릭).

---

## 🧪 Technical & Verification
- **Manifest V3** 완벽 준수
- **14단계 자동화 검증 스위트 (`test/verify.js`)** 100% 통과
- **배포 패키지**: `style-scrather-v4.0.3.zip` (35개 핵심 파일, 무결성 검증 완료)

---

## 📄 License
- **License**: Apache License 2.0
- **Copyright**: 2024-2026 Rheehose (Rhee Creative) / Hose Rhee (이호세)
