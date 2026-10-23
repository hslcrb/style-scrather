## 🚀 Style Scratcher (스타일 스크래처) v3.0.0 대규모 메이저 릴리즈

디자이너와 프론트엔드 개발자를 위한 화이트 미니멀 웹 인스펙터 & 에셋 스튜디오 **Style Scratcher v3.0.0** 정식 릴리즈입니다!

---

### 🏷️ 3자리 버전 관리 체계 (Semantic Versioning)
Style Scratcher는 3자리 버전 체계(`Major.Minor.Patch`)를 엄격히 준수합니다.
- **Major (3)**: 대규모 아키텍처 및 라이브 에디터 스튜디오 기능 도입
- **Minor (0)**: 신규 기능 패키지
- **Patch (0)**: 안정화 릴리즈

---

### ✨ v3.0.0 주요 신규 기능 (What's New in v3.0.0)

1. **✏️ 실시간 에셋 & 콘텐츠 라이브 편집기 (Live Asset Editor)**
   - **텍스트 실시간 수정**: 선택한 DOM 요소의 텍스트 내용을 즉시 입력하여 변경 가능.
   - **요소 직접 타이핑 (`contentEditable`)**: 웹페이지 본문 위에 직접 커서를 두고 타이핑하는 직관적 편집 모드.
   - **이미지 교체 (Image Swapper)**: URL 교체, 원클릭 고화질 Unsplash 랜덤 디자인 이미지 교체, 로컬 파일 드래그/업로드 즉시 적용.
   - **SVG 벡터 속성 & 원본 XML 편집**: `<svg>` 요소 탐지 시 `fill`, `stroke`, `stroke-width`(선 두께 슬라이더) 시각적 튜닝 및 원본 XML 코드 직접 수정/교체.

2. **🎨 감각적 컬러 스위트 & 네이티브 스포이트 (Sensory Color Suite)**
   - **Chrome 네이티브 스포이트 (`window.EyeDropper`)**: 웹페이지 안팎 어디서든 픽셀 단위로 정밀하게 색상을 추출하여 배경색/텍스트색에 즉시 적용.
   - **WCAG 2.1 명도 대비율 분석**: 텍스트와 배경 간 명도 대비(`21:1 [AAA]`, `4.5:1 [AA]`)를 계산하여 웹 접근성 준수 여부 시각화.
   - **디자이너 큐레이션 프리셋 팔레트**: 디자이너들이 가장 선호하는 감각적인 색상 칩 제공.

3. **🛡️ 안전 검사 모드 (Safe Inspect Mode - Click Invalidation)**
   - 인스펙팅 도중 링크(`<a>`), 폼 전송 버튼(`<button>`, `<input type="submit">`)을 잘못 클릭하여 다른 페이지로 이동하거나 화면이 새로고침되는 현상을 캡처 단계 이벤트 차단으로 완벽 무력화.

4. **🎯 정밀 십자선 커서 & 실시간 좌표 가이드 (Precision Crosshair Cursor)**
   - 단축키 <kbd>Alt</kbd> + <kbd>C</kbd> 또는 도구 탭에서 활성화.
   - 마우스 커서를 따라 움직이는 섬세한 십자선 헤어라인과 실시간 `X: 340 Y: 520 <button>` 좌표/태그 뱃지 제공.

5. **🔤 가독성 극대화 오버레이 뱃지 & 스튜디오 타이포그래피**
   - 인스펙팅 시 표시되는 안내 텍스트를 `12px` / `700 Bold`로 대폭 확대.
   - 화이트 보더 및 드롭섀도우를 추가하여 어떤 배경에서도 선명하게 시인성 확보.
   - 플로팅 독 전반에 모던 스퀘어클(`6px` ~ `8px`, 캡슐 반원 배제) 디자인 및 위계 정립.

---

### 📦 Chrome 브라우저 설치 방법

1. 아래 **Assets**에서 `style-scrather-v3.0.0.zip`을 다운로드합니다.
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저에서 `chrome://extensions` 에 접속합니다.
4. 우측 상단의 **'개발자 모드 (Developer mode)'**를 활성화합니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭하고 압축 해제한 폴더를 선택합니다.
6. 단축키 안내:
   - <kbd>Alt</kbd> + <kbd>S</kbd>: Style Scratcher 인스펙터 토글
   - <kbd>Alt</kbd> + <kbd>C</kbd>: **정밀 십자선 커서 & 좌표 토글**
   - <kbd>Z</kbd> (꾹 누름): **인스턴트 줌인 / 줌아웃**
   - <kbd>Alt</kbd> + <kbd>F</kbd>: 툴팁 / 화면 프리징
   - <kbd>Alt</kbd> + <kbd>U</kbd>: 복사 / 우클릭 차단 해제
   - <kbd>Esc</kbd>: 선택 요소 고정 해제

---

### 📄 License
- **License**: Apache License 2.0
- **Copyright**: 2024-2026 Rheehose (Rhee Creative) / Hose Rhee (이호세)
