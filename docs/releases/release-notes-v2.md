## 🚀 Style Scratcher (스타일 스크래처) v2.0 정식 릴리즈

웹 프론트엔드의 심층 영역(다중 단위 측정, 자바스크립트 인터랙션, WebGL 그래픽, 복사 차단 무력화, 애니메이션 슬로우모션)을 완벽하게 다룰 수 있는 **Style Scratcher v2.0** 대규모 업데이트입니다!

---

### ✨ v2.0 주요 신규 기능 (What's New in v2.0)

1. **📐 다중 단위(Multi-Unit) 거리 측정 엔진**
   - 픽셀(`px`)뿐만 아니라 `rem`, `em`, `%`, `vw`, `vh`, `pt`로 실시간 거리 환산 및 `1.5rem (24px)` 듀얼 뱃지 표시.
   - 박스 모델(Margin/Padding) 수치 또한 선택한 단위로 즉시 변환.

2. **⚡ 인터랙션 & JS 이벤트 리스너 탐지기**
   - 마우스를 떼도 `:hover`, `:active`, `:focus` 가상 클래스를 강제로 켜두고 스타일 검사.
   - 요소에 등록된 `click`, `mouseenter` 등 모든 자바스크립트 이벤트 핸들러 소스 코드 파싱 및 프리뷰.

3. **🎮 WebGL & Canvas / SVG 심층 그래픽 분석기**
   - `<canvas>` 선택 시 렌더링 컨텍스트(`WebGL 2.0`, `WebGL 1.0`, `Canvas 2D`), 버퍼 해상도 vs CSS 렌더링 크기, DPR 선명도, VRAM 점유율 계산.
   - 마스킹 해제된 실제 GPU 칩셋 이름(NVIDIA, Apple Silicon, AMD 등), 쉐이딩 언어, 지원 확장 수 텔레메트리 제공.
   - `<svg>`의 viewBox, path 개수, 기본 도형, 그래디언트 분석.

4. **🔓 복사/우클릭 차단 해제 & 툴팁 프리징 (Power Tools)**
   - `user-select: none !important`와 우클릭/드래그 방지 스크립트를 원클릭으로 무력화하여 텍스트 복사 허용 (`Alt + U`).
   - 마우스를 떼면 바로 사라져 버리는 툴팁, 모달, 호버 팝업을 화면에 멈춰놓는 스크립트 프리징 (`Alt + F`).

5. **🎬 애니메이션 슬로우모션 & Cubic-Bezier 곡선**
   - Web Animations API 기반 글로벌 재생 속도 제어 (`0.1x` 초저속, `0.25x`, `0.5x`, `1.0x`, `2.0x`).
   - Figma/CSS 표준 `cubic-bezier` 가속도 곡선을 SVG 그래프로 실시간 렌더링.

6. **🎨 White Minimal Studio v2.0 디자인 시스템**
   - 캡슐/반원 버튼 배제, 단정하고 단단한 `6px` ~ `8px` 스퀘어클 버튼 라디우스 엄격 유지.
   - 세련된 탭 전환 및 단위 선택 세그먼트 컨트롤.

---

### 📦 Chrome 브라우저 설치 방법

1. 아래 **Assets**에서 `style-scrather-v2.0.0.zip`을 다운로드합니다.
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저에서 `chrome://extensions` 에 접속합니다.
4. 우측 상단의 **'개발자 모드 (Developer mode)'**를 활성화합니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭하고 압축 해제한 폴더를 선택합니다.
6. 웹 서핑 중 `Alt + S` 를 누르면 언제 어디서나 Style Scratcher v2.0이 실행됩니다!

---

### 📄 License

- **License**: Apache License 2.0
- **Copyright**: 2024-2026 Rheehose (Rhee Creative) / Hose Rhee (이호세)
