## 🚀 Style Scratcher (스타일 스크래처) v3.0.1 패치 릴리즈

**황금비율(Golden Ratio, φ = 1.618) 모듈러 타이포그래피 위계**를 도입하여 플로팅 독과 확장 프로그램 UI 전반의 시각적 안정감과 심미성을 극대화한 **Style Scratcher v3.0.1** 패치 릴리즈입니다!

---

### 🏷️ 3자리 버전 관리 체계 (Semantic Versioning)
Style Scratcher는 3자리 버전 체계(`Major.Minor.Patch`)를 엄격히 준수합니다.
- **Major (3)**: 대규모 메이저 아키텍처 및 라이브 에셋 스튜디오
- **Minor (0)**: 신규 기능 패키지
- **Patch (1)**: **황금비율(1.618) 타이포그래피 정밀 튜닝 패치**

---

### ✨ v3.0.1 패치 주요 변경 내역 (What's in v3.0.1)

1. **📐 수학적 황금비율 (φ = 1.618) 모듈러 타이포그래피 위계 구축**
   - 기본 크기 $f_0 = 11\text{px}$을 축으로, 황금비율의 제곱근 $\sqrt{\phi} \approx 1.272$ 기하평균을 하프스텝으로 적용한 모듈러 스케일 완성:
     - **Micro (Level -1)**: `8.65px` (독 버전 뱃지, 미세 메타 텍스트)
     - **Caption (Level -0.5)**: `10px` (보조 설명문, 빈 상태 가이드)
     - **Base (Level 0)**: `11px` (탭 버튼, 단위 칩, 기본 바디)
     - **Body (Level +0.5)**: `12.5px` (컨트롤 텍스트, 텍스트에어리어)
     - **Label (Level +1)**: `14px` (독 타이틀, 섹션 헤더, 수치/컬러 인풋)
     - **Title (Level +2)**: `17.8px` (대형 타이틀 분할)
   - **황금 행간 (`1.618`)**: 설명문과 장문 텍스트에 1.618 행간을 적용하여 장시간 인스펙팅 시 눈의 피로 최소화.
   - **스너그 행간 (`1.382 = 2 - 1/φ`)**: 제목과 레이블에 1.382의 정갈한 헤더 행간을 부여.

2. **🪟 플로팅 독 및 팝업 UI 전반 일관된 토큰 정렬**
   - Shadow DOM 격리 스타일시트(`shadow-styles.css`) 및 팝업 스타일시트(`popup.css`)에 `--golden-ratio: 1.618` 토큰을 통합하여 확장 프로그램 전체의 시각적 위계 일체화.

---

### 📦 Chrome 브라우저 설치 방법

1. 아래 **Assets**에서 `style-scrather-v3.0.1.zip`을 다운로드합니다.
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
