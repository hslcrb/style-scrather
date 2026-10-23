# Style Scratcher v4.0.1 - 2-Row Grid Navigation, Vector SVG & Studio Red Theme Release

디자이너와 프론트엔드 개발자를 위한 화이트 미니멀 피그마 감성 웹 인스펙터 & 에디트 스튜디오 **Style Scratcher v4.0.1** 정식 패치 릴리즈입니다.

---

## 3자리 시맨틱 버전 체계 (Semantic Versioning)
Style Scratcher는 `Major.Minor.Patch` 3자리 버저닝을 엄격히 준수합니다.
- **Major (4)**: v4.0.0 풀 에디트 스튜디오 메이저 아키텍처 (검사/편집 모드 분리, 디바이스 뷰포트 목업, 피그마 폰트 스튜디오, Hug/Fill/Fixed 감지, W3C 탭 순서, 스마트 HUD, React JSX 추출)
- **Minor (0)**: 안정화 및 핵심 모듈 패키지
- **Patch (1)**: **2줄 탭 네비게이션 그리드(설정 포함 10개 탭 직관 노출), 유니코드 이모지 완전 제거 및 정밀 SVG 벡터화, 고품격 레드 스튜디오 테마(Studio Red #E11D48) 전면 전환**

---

## v4.0.1 핵심 변경 사항 (What's New & Fixed in v4.0.1)

### 1. 2-Row Grid Tab Navigation (모든 10개 탭 직관 노출)
- **배경**: 기존 단일행 가로 스크롤 방식에서 380px 독 너비 한계로 인해 '모션' 탭 뒤의 'WebGL', '도구', '코드', '설정' 탭이 보이지 않고 가려지던 문제를 완벽 해결.
- **개편**: 5×2 균형 그리드(`grid-template-columns: repeat(5, 1fr)`) 레이아웃을 도입하여 모든 탭을 2줄로 직관 배치.
  - **1행**: 인스펙터 | 목업 | 폰트 | 에셋 | 인터랙션
  - **2행**: 모션 | WebGL | 도구 | 코드 | 설정
- 스크롤 없이 **'설정'을 포함한 10개 모든 탭이 한눈에 파악**되며 즉각적인 탭 전환 가능.
- 최소화(Minimize) 및 복원 시에도 깨짐 없이 안정적인 그리드 유지.

### 2. Zero Unicode Emojis & High-End SVG Vector Iconography (NO-EMOJI)
- UI 전반의 유니코드 이모지를 100% 제거하고, 디자이너 도구 수준의 정밀한 인라인 SVG 벡터 아이콘으로 교체:
  - **병렬 글리프 수확기**: `⚡ 병렬 글리프 수확 시작` ➔ 인라인 번개 SVG 벡터 아이콘 + 텍스트
  - **글리프 수확 완료**: `⚡` 이모지 ➔ 정밀 체크마크 SVG 아이콘
  - **스포이트**: `🎨` ➔ 정밀 피펫 SVG 아이콘
  - **디바이스 목업**: 기기 이모지(`📺`, `💻`, `📱`) 제거 및 타이포그래피 + SVG 회전/닫기 버튼
  - **스마트 우클릭 HUD**: 타이핑, 아웃라인화, Tailwind 복사, React 복사, 에셋 다운로드, 순서 이동(위/아래), 복제, 삭제 등 10개 메뉴 항목에 맞춤형 인라인 SVG 아이콘 적용
  - **빈 상태(Empty State)**: 에셋, 인터랙션, 그래픽 탭의 이모지를 미니멀 벡터 일러스트레이션으로 전면 교체

### 3. Studio Red Color Theme (레드 계열 전면 전환)
- 기존 블루 팔레트에서 세련되고 감각적인 로즈/크림슨 레드 스튜디오 테마로 전면 전환:
  - **Primary Accent**: `#E11D48` (Rose 600)
  - **Hover Accent**: `#BE123C` (Rose 700)
  - **Active / Dark**: `#9F1239` (Rose 800)
  - **Light Background Tint**: `#FFF1F2` (Rose 50)
  - **Border**: `#FFE4E6` / `#FECDD3`
  - **Glow & Ring**: `rgba(225, 29, 72, 0.15)`
  - **Highlight**: `#F43F5E` (Rose 500)
- 적용 영역:
  - 플로팅 독: 상단 로고, v4.0.1 뱃지, 검사/편집 스위처, 탭 활성 인디케이터, 글리프 수확 버튼 및 프로그레스 바, 리셋 버튼
  - 오버레이 캔버스: 요소 선택 아웃라인(`#E11D48`), 핸들, 호버 아웃라인(`#F43F5E`), 거리 측정 룰러 피그마 가이드라인(`#EF4444`)과 완벽한 톤앤매너 결합
  - 팝업 창 및 확장 프로그램 아이콘(16px, 48px, 128px PNG) 재생성 완료

---

## Chrome 브라우저 설치 방법

1. 아래 **Assets**에서 `style-scrather-v4.0.1.zip`을 다운로드합니다.
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저에서 `chrome://extensions` 에 접속합니다.
4. 우측 상단의 **'개발자 모드 (Developer mode)'**를 활성화합니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭하고 압축 해제한 폴더를 선택합니다.
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
- **13단계 자동화 검증 스위트 (`test/verify.js`)** 100% 통과
- **배포 패키지**: `style-scrather-v4.0.1.zip` (33개 핵심 파일, 무결성 검증 완료)

---

## License
- **License**: Apache License 2.0
- **Copyright**: 2024-2026 Rheehose (Rhee Creative) / Hose Rhee (이호세)
