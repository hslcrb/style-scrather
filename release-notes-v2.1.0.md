## 🚀 Style Scratcher (스타일 스크래처) v2.1.0 정식 릴리즈

새로운 **인스턴트 줌인 / 줌아웃 (Instant Zoom)** 기능이 추가된 **Style Scratcher v2.1.0** 릴리즈입니다!

---

### 🏷️ 3자리 버전 관리 체계 (Semantic Versioning)
Style Scratcher는 표준 3자리(`Major.Minor.Patch`) 버전 체계를 사용합니다.
- **Major (첫 번째)**: 대규모 아키텍처 및 패러다임 변화
- **Minor (두 번째)**: 핵심 신규 기능 및 사용자 인터랙션 추가
- **Patch (세 번째)**: 버그 픽스 및 미세 최적화

---

### ✨ v2.1.0 주요 신규 기능 (What's New in v2.1.0)

1. **🔍 피그마 감성 인스턴트 줌인 / 줌아웃 (Instant Zoom)**
   - **비대칭 가속도 애니메이션 곡선**: <kbd>Z</kbd> 키를 꾹 누르고 있으면 마우스 커서 위치를 중심으로 부드럽게 깊은 줌인(520ms 감속 곡선, 2.4x)이 실행됩니다.
   - **스내피 원복 줌아웃**: 손을 떼는 순간 줌인보다 훨씬 빠른 속도(200ms)로 매끄럽게 제자리로 돌아옵니다.
   - **노멀 줌과의 완벽한 공존**: 전체 화면 레이아웃을 확대/축소하는 브라우저 기본 노멀 줌(<kbd>Ctrl</kbd> + <kbd>+</kbd>/<kbd>-</kbd>)과 충돌 없이, 피그마처럼 마우스 위치의 디테일을 순간적으로 돋보기처럼 확대해 볼 수 있습니다.

2. **🛠️ 플로팅 독 전용 줌 컨트롤러**
   - 도구 탭에서 마우스로 '꾹 눌러서 줌' 버튼을 누르고 있는 동안에도 키보드 없이 직관적으로 인스턴트 줌을 체험할 수 있습니다.

---

### 📦 Chrome 브라우저 설치 방법

1. 아래 **Assets**에서 `style-scrather-v2.1.0.zip`을 다운로드합니다.
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저에서 `chrome://extensions` 에 접속합니다.
4. 우측 상단의 **'개발자 모드 (Developer mode)'**를 활성화합니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭하고 압축 해제한 폴더를 선택합니다.
6. 단축키:
   - <kbd>Z</kbd> (꾹 누름): 마우스 위치 인스턴트 줌인 / 줌아웃
   - <kbd>Ctrl</kbd> + <kbd>+</kbd>/<kbd>-</kbd>: 브라우저 노멀 줌
   - <kbd>Alt</kbd> + <kbd>S</kbd>: 인스펙터 토글
   - <kbd>Alt</kbd> + <kbd>F</kbd>: 툴팁/화면 프리징
   - <kbd>Alt</kbd> + <kbd>U</kbd>: 복사/우클릭 차단 해제

---

### 📄 License
- **License**: Apache License 2.0
- **Copyright**: 2024-2026 Rheehose (Rhee Creative) / Hose Rhee (이호세)
