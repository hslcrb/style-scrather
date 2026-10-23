# Style Scratcher v4.0.2. - Strict Dot Version Standard, Brand Color & Update Guardian Release

디자이너와 프론트엔드 개발자를 위한 화이트 미니멀 피그마 감성 웹 인스펙터 & 에디트 스튜디오 **Style Scratcher v4.0.2.** 정식 패치 릴리즈입니다.

---

## 🏷️ 엄격한 끝 마침표 버전 체계 (Strict Dot Versioning Standard)
Style Scratcher는 버전의 명확성과 일관성을 위해 **반드시 끝에 마침표(dot)를 포함하는 `vX.Y.Z.` 규격**을 쐐기로 단단히 확립합니다:
- **표준 표기 형식**: `v` + `Major` + `.` + `Minor` + `.` + `Patch` + `.` (예: **`v4.0.2.`**, **`v1.1.1.`**)
- **Major (4)**: 풀 스튜디오 메이저 아키텍처 (검사/편집 분리, 목업, 폰트 스튜디오, Hug/Fill/Fixed 감지, W3C 탭 순서, 스마트 HUD, React JSX)
- **Minor (0)**: 안정화 및 핵심 모듈 패키지
- **Patch (2)**: **GitHub 릴리즈 자동 감지 & 원클릭 업데이트 (Update Guardian), 공식 브랜드 컬러 명시 및 끝 마침표 버전 표기 표준화**

> **참고 (Technical Note)**: 브라우저 내부 `manifest.json` 파서의 구문 제약상 내부 메타데이터는 `"4.0.2"`로 기록되며, 플로팅 독 뱃지, 팝업, 릴리즈 노트, 대시보드 및 모든 사용자 노출 인터페이스에는 엄격한 **`v4.0.2.`** 표준 표기를 적용합니다.

---

## 🎨 공식 브랜드 컬러 (Official Brand Color Specification)
Style Scratcher의 정체성과 디자인 일관성을 보장하기 위해 **공식 브랜드 컬러 시스템**을 명시합니다:
- **Primary Brand Accent**: `#E11D48` (Studio Crimson / Rose 600 - 감각적이고 세련된 스튜디오 레드)
- **Hover Accent**: `#BE123C` (Rose 700)
- **Active / Dark Accent**: `#9F1239` (Rose 800)
- **Subtle Background Tint**: `#FFF1F2` (Rose 50)
- **Subtle Border**: `#FFE4E6` / `#FECDD3`
- **Focus Ring & Glow**: `rgba(225, 29, 72, 0.15)`
- **Highlight Accent**: `#F43F5E` (Rose 500)

*플로팅 독의 '설정' 탭에 공식 브랜드 컬러 스와치 및 규격 안내 카드가 기본 탑재되어 언제든지 색상 값을 확인할 수 있습니다.*

---

## 🚀 v4.0.2. 핵심 신규 기능 (What's New in v4.0.2.)

### 1. GitHub 릴리즈 자동 감지 (GitHub Releases Auto-Detection)
- 백그라운드에서 GitHub 원격 저장소(`hslcrb/style-scrather`)의 최신 릴리즈를 비동기로 자동 확인.
- 현재 실행 중인 버전(`v4.0.2.`)과 비교하여 새로운 패치나 메이저 업데이트가 배포되면 즉시 감지.
- API 반복 호출을 방지하기 위해 지능형 30분 캐시(`localStorage`) 메커니즘 탑재.

### 2. 스마트 업데이트 알림 배너 (Update Alert Banner)
- 새 버전이 발견되면 플로팅 독 상단에 고급스러운 Rose 레드 배너가 부드러운 애니메이션과 함께 노출.
- `새 버전 발견: vX.X.X.` 메시지와 함께 즉각적인 조치 버튼 제공.
- 우측 닫기 버튼으로 언제든지 닫을 수 있으며, '설정' 탭에서 상시 확인 가능.

### 3. 원클릭 간편 업데이트 & ZIP 다운로드 (One-Click Auto-Update)
- 사용자가 GitHub 릴리즈 페이지를 일일이 찾아 들어갈 필요 없이, 알림 배너나 설정 탭의 **`[원클릭 ZIP 다운로드 & 업데이트]`** 버튼 하나만 누르면 최신 배포 ZIP 파일(`style-scrather-vX.X.X.zip`)이 브라우저에서 즉시 다운로드.
- 다운로드 즉시 토스트 알림과 함께 Chrome 확장 프로그램 재로드 가이드 제공.

### 4. '설정' 탭 내 업데이트 관리 센터 (Update Guardian Center)
- **브랜드 아이덴티티 카드**: `#E11D48` 컬러 스와치, 규격 명칭 및 끝 마침표 버전 체계(`v4.0.2.`) 명시.
- **업데이트 관리 카드**:
  - 현재 상태 ("최신 버전 유지 중" vs "새 버전 발견")
  - **`[지금 업데이트 확인]`**: GitHub API 강제 리프레시를 통한 실시간 버전 스캔
  - **`[릴리즈 목록]`**: GitHub 전체 릴리즈 히스토리 페이지 원클릭 이동
  - 새 버전 감지 시 릴리즈 요약 노트 및 원클릭 다운로드 버튼 동적 표시.

---

## Chrome 브라우저 설치 및 업데이트 방법

1. 아래 **Assets**에서 `style-scrather-v4.0.2.zip`을 다운로드합니다 (기존 사용자는 독 알림 배너의 **원클릭 업데이트**로 즉시 다운로드 가능).
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저에서 `chrome://extensions` 에 접속합니다.
4. 우측 상단의 **'개발자 모드 (Developer mode)'**를 활성화합니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭하고 압축 해제한 폴더를 선택합니다 (기존 사용자는 새로고침 아이콘 클릭).
6. 단축키 안내:
   - <kbd>Alt</kbd> + <kbd>S</kbd>: Style Scratcher 인스펙터 토글
   - <kbd>Alt</kbd> + <kbd>E</kbd>: 검사 모드 / 편집 모드 전환
   - <kbd>Alt</kbd> + <kbd>C</kbd>: 정밀 십자선 커서 & 좌표 토글
   - <kbd>Alt</kbd> + <kbd>+</kbd> / <kbd>-</kbd> / <kbd>0</kbd>: 인스턴트 줌 (확대 / 축소 / 원복)
   - <kbd>Alt</kbd> + <kbd>F</kbd>: 툴팁 / 화면 프리징
   - <kbd>Alt</kbd> + <kbd>U</kbd>: 복사 / 우클릭 차단 해제
   - <kbd>Esc</kbd>: 선택 요소 고정 해제

---

## Technical & Verification
- **Manifest V3** 완벽 준수
- **14단계 자동화 검증 스위트 (`test/verify.js`)** 100% 통과
- **배포 패키지**: `style-scrather-v4.0.2.zip` (34개 핵심 파일, 무결성 검증 완료)

---

## License
- **License**: Apache License 2.0
- **Copyright**: 2024-2026 Rheehose (Rhee Creative) / Hose Rhee (이호세)
