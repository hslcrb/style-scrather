## 🚀 Style Scratcher (스타일 스크래처) v3.0.2 패치 릴리즈

탭 연결 오류(`Could not establish connection. Receiving end does not exist`)를 완벽히 해결하는 **연결 가디언 & 동적 자동 인젝션 (Connection Guardian)** 탑재 패치 **Style Scratcher v3.0.2** 릴리즈입니다!

---

### 🏷️ 3자리 버전 관리 체계 (Semantic Versioning)
Style Scratcher는 3자리 버전 체계(`Major.Minor.Patch`)를 엄격히 준수합니다.
- **Major (3)**: 대규모 메이저 아키텍처 및 라이브 에셋 스튜디오
- **Minor (0)**: 신규 기능 패키지
- **Patch (2)**: **연결 가디언 및 사전 열린 탭 동적 자동 인젝션 패치**

---

### ✨ v3.0.2 패치 핵심 해결 내역 (What's Fixed in v3.0.2)

1. **🛡️ 탭 연결 오류 완벽 해결 (`Could not establish connection. Receiving end does not exist`)**
   - **사전 열린 탭 자동 인젝션**: 확장 프로그램을 재로드하거나 새로 설치했을 때, 기존에 열려 있던 웹페이지를 일일이 새로고침하지 않아도 팝업에서 인스펙터를 켜거나 <kbd>Alt</kbd>+<kbd>S</kbd>를 누르면 `chrome.scripting.executeScript`로 콘텐츠 스크립트 의존성을 실시간 자동 주입하여 즉각 연결.
   - **보안 제한 페이지 자동 탐지 (Restricted URL Guardian)**: `chrome://extensions`, `chrome://newtab`, Chrome 웹스토어 등 콘텐츠 스크립트 실행이 불가능한 브라우저 내부 시스템 페이지를 사전에 탐지하여 사용자에게 정갈한 안내 배너를 제공하고 무의미한 콘솔 에러를 원천 차단.

2. **📐 황금비율 (Golden Ratio φ = 1.618) 모듈러 타이포그래피 스케일 완벽 결합**
   - 기하평균 $\sqrt{\phi} \approx 1.272$ 기반 모듈러 스케일(`8.65px` ~ `17.8px`) 및 황금 행간(`1.618`) 유지.

---

### 📦 Chrome 브라우저 설치 방법

1. 아래 **Assets**에서 `style-scrather-v3.0.2.zip`을 다운로드합니다.
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저에서 `chrome://extensions` 에 접속합니다.
4. 우측 상단의 **'개발자 모드 (Developer mode)'**를 활성화합니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭하고 압축 해제한 폴더를 선택합니다.
6. 단축키 안내:
   - <kbd>Alt</kbd> + <kbd>S</kbd>: Style Scratcher 인스펙터 토글 (미주입 탭 자동 인젝션)
   - <kbd>Alt</kbd> + <kbd>C</kbd>: **정밀 십자선 커서 & 좌표 토글**
   - <kbd>Z</kbd> (꾹 누름): **인스턴트 줌인 / 줌아웃**
   - <kbd>Alt</kbd> + <kbd>F</kbd>: 툴팁 / 화면 프리징
   - <kbd>Alt</kbd> + <kbd>U</kbd>: 복사 / 우클릭 차단 해제
   - <kbd>Esc</kbd>: 선택 요소 고정 해제

---

### 📄 License
- **License**: Apache License 2.0
- **Copyright**: 2024-2026 Rheehose (Rhee Creative) / Hose Rhee (이호세)
