# Style Scratcher (스타일 스크래처) v4.0.3.

<div align="center">

![Style Scratcher Logo](icons/icon128.png)

### 디자이너와 프론트엔드 개발자의 애환을 종결짓는 차세대 웹 인스펙터 & 실시간 에셋 스튜디오

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](#)
[![Version](https://img.shields.io/badge/Version-v4.0.3.-E11D48.svg)](#)
[![Brand Color](https://img.shields.io/badge/Brand%20Color-%23E11D48-E11D48.svg)](#)
[![Design](https://img.shields.io/badge/Design-White%20Minimal%20Studio-black.svg)](#)
[![Typography](https://img.shields.io/badge/Typography-Golden%20Ratio%201.618-gold.svg)](#)

</div>

---

## 📌 Style Scratcher 소개

**Style Scratcher**는 웹 브라우저 화면을 **피그마(Figma) 캔버스 겸 라이브 에디터 스튜디오**처럼 자유롭게 다룰 수 있게 해주는 고성능 화이트 미니멀 Chrome 브라우저 확장 프로그램(Manifest V3)입니다.

### 🎨 공식 브랜드 컬러 (Brand Color Standard)
Style Scratcher는 일관되고 세련된 고품격 디자이너 스튜디오 아이덴티티를 위해 **공식 브랜드 컬러**를 엄격히 규정합니다:
- **Primary Brand Accent**: `#E11D48` (Studio Crimson / Rose 600)
- **Hover Accent**: `#BE123C` (Rose 700)
- **Active Accent**: `#9F1239` (Rose 800)
- **Background Subtle Tint**: `#FFF1F2` (Rose 50)
- **Subtle Border**: `#FFE4E6` / `#FECDD3`
- **Focus Glow**: `rgba(225, 29, 72, 0.15)`

### 🏷️ 버전 표기 표준 규격 (Strict Dot Versioning Standard)
Style Scratcher의 모든 사용자 노출 인터페이스(플로팅 독 뱃지, 팝업, 릴리즈 노트, 대시보드 문서)는 **반드시 `vX.Y.Z.` 형식처럼 끝에 마침표(dot)를 포함**하는 규격을 준수합니다:
- **형식**: `v` + `Major` + `.` + `Minor` + `.` + `Patch` + `.` (예: **`v4.0.3.`**, **`v1.1.1.`**)
- **Major (4)**: 풀 스튜디오 메이저 아키텍처
- **Minor (0)**: 안정화 및 핵심 모듈 패키지
- **Patch (3)**: **서브픽셀 마칭 스퀘어 트루 벡터 글리프 아웃라이너, 웹폰트 바이너리 다운로더, W3C SVG 폰트 빌더, 병렬 글리프 실측 수확기**

---

## 🛡️ v3.0.2 패치: 연결 가디언 & 동적 자동 인젝션 (Connection Guardian)

Chrome 확장 프로그램을 재로드하거나 새로 설치했을 때, 기존에 열려 있던 탭에서 팝업을 열면 발생하던 대표적 오류인 **`Could not establish connection. Receiving end does not exist`** 문제를 원천 해결했습니다:

1. **사전 열린 탭 동적 자동 인젝션 (Dynamic Auto-Injection)**:
   - 사용자가 페이지를 일일이 새로고침하지 않아도, 팝업에서 인스펙터를 켜거나 <kbd>Alt</kbd>+<kbd>S</kbd>를 누르면 `chrome.scripting.executeScript`를 통해 17개의 핵심 콘텐츠 스크립트 의존성을 탭에 실시간 주입하고 즉각 통신을 연결합니다.
2. **보안 정책 제한 페이지 자동 탐지 (Restricted URL Guardian)**:
   - Chrome 내부 페이지(`chrome://extensions`, `chrome://newtab`, 웹스토어 등)에서는 보안 정책상 콘텐츠 스크립트가 실행될 수 없습니다. 이를 사전에 감지하여 팝업 내에 부드러운 안내 경고 배너를 띄우고 불필요한 콘솔 오류 발생을 차단합니다.
3. **무결점 에러 핸들링**:
   - 백그라운드 서비스 워커 및 팝업 간의 모든 통신 단계에 이중 안전장치를 마련하여 탭이 닫히거나 언로드된 상태에서도 크래시 없이 견고하게 동작합니다.

---

## 📐 황금비율 (Golden Ratio φ = 1.618) 모듈러 타이포그래피 위계

르네상스 고전 건축과 애플/피그마 디자인 시스템의 근간인 **황금비율($\phi \approx 1.618034$) 모듈러 스케일**을 플로팅 독과 팝업 전체 UI에 적용하여 시각적 위계의 균형감과 가독성을 극대화했습니다.

### 1. 기하학적 모듈러 스케일 구조 (Geometric Progression)
기본 단위 $f_0 = 11\text{px}$을 중심으로, 한 단계 격차로 인한 급격한 폰트 점프를 방지하고자 황금비율의 기하평균 제곱근 $\sqrt{\phi} \approx 1.27202$ ($1.27202 \times 1.27202 = 1.61803$)를 하프스텝 승수로 활용한 정밀 스케일을 구축했습니다:

| 스케일 레벨 | 수식 단계 | 계산 크기 | 실제 적용 UI 구성 요소 |
| :--- | :--- | :--- | :--- |
| **Micro (Level -1)** | $11 / 1.272$ | **`8.65px`** | 독 버전 뱃지(`v3.0.2`), 미세 메타데이터 라벨 |
| **Caption (Level -0.5)** | $11 / 1.100$ | **`10px`** | 안내 설명문, 안전 모드 설명, 빈 상태 설명 |
| **Base (Level 0)** | $11\text{px}$ 기준 | **`11px`** | 탭 네비게이션 버튼, 단위 칩, 기본 본문 |
| **Body (Level +0.5)** | $11 \times 1.136$ | **`12.5px`** | 설정 컨트롤 라벨, 텍스트 에어리어 본문 |
| **Label (Level +1)** | $11 \times 1.272$ | **`14px`** | 독 메인 타이틀, 섹션 타이틀, 수치/컬러 인풋 필드 |
| **Subhead (Level +1.5)** | $11 \times 1.455$ | **`16px`** | 모달 및 카드 서브헤딩 |
| **Title (Level +2)** | $11 \times 1.618$ | **`17.8px`** | 대형 섹션 헤더 및 황금비 분할 타이틀 |
| **Brand (Level +3)** | $11 \times 1.618 \times 1.272$ | **`22.6px`** | 팝업 헤더 브랜드 타이틀 |

### 2. 황금 행간 (Golden Line-Height)
- **Golden Paragraph Leading (`1.618`)**: 설명문, 안내 텍스트, 라이브 텍스트 에어리어에 1.618 황금 비율 행간을 적용하여 장시간 인스펙팅 시 눈의 피로를 최소화.
- **Snug Header Leading (`1.382 = 2 - 1/φ`)**: 제목과 레이블에 1.382의 정갈한 헤더 행간을 부여하여 컴팩트하면서도 단단한 그리드 정렬 달성.

---

## ✨ Style Scratcher 핵심 기능 (Features)

### 1. ✏️ 실시간 에셋 & 콘텐츠 라이브 편집기 (Live Asset & Content Editor)
웹 페이지의 요소를 선택하여 DOM을 새로고침 없이 즉시 인터랙티브하게 조작합니다:
- **텍스트 라이브 수정 & `contentEditable`**: 입력창에서 글자를 바꾸는 즉시 실시간 반영되며, '요소 직접 타이핑' 버튼을 누르면 실제 본문에서 커서를 두고 문서처럼 타이핑 가능.
- **이미지 소스 스왑 (Image Swapper)**: URL 직접 입력, 클릭 한 번으로 고화질 Unsplash 랜덤 디자인 이미지 교체, 로컬 파일(`FileReader`)을 통한 실시간 이미지 갈아끼우기 지원.
- **SVG 벡터 속성 & 원본 XML 편집기**: `<svg>` 요소 탐지 시 `fill`, `stroke`, `stroke-width`(선 두께 슬라이더), 투명도를 시각적으로 조절하고 원본 SVG XML 코드를 직접 수정/반영.

### 2. 🎨 감각적 컬러 스위트 & 네이티브 스포이트 (Sensory Color Suite)
- **Chrome 네이티브 스포이트 (EyeDropper)**: `window.EyeDropper` API와 연동하여 웹페이지뿐만 아니라 화면 전체 어디서든 픽셀 단위로 색상을 정밀하게 스포이트 추출.
- **WCAG 2.1 명도 대비율 분석**: 텍스트와 배경색 간의 명도 대비를 실시간 계산하여 `21:1 [AAA]`, `4.5:1 [AA]` 등 웹 접근성 합격 여부를 직관적인 뱃지로 표시.
- **디자이너 큐레이션 프리셋 팔레트**: 전문 UI/UX 디자이너들이 선호하는 세련된 헥스 코드 칩을 제공하여 원클릭으로 배경/텍스트 색상 적용.

### 3. 🛡️ 안전 검사 모드 (Safe Inspect Mode - Click Invalidation)
- **링크 클릭 튕김 원천 차단**: 인스펙팅 도중 링크(`<a>`), 제출 버튼(`<button>`, `<input type="submit">`), 폼 요소를 잘못 클릭하여 다른 웹페이지로 이동하거나 화면이 새로고침되는 참사를 캡처 단계 이벤트 무력화(`preventDefault`, `stopPropagation`)로 완벽 방지.
- 플로팅 독 상단 배너에서 간편하게 ON/OFF 토글 가능.

### 4. 🎯 정밀 십자선 커서 & 실시간 좌표 가이드 (Precision Crosshair Cursor)
- <kbd>Alt</kbd> + <kbd>C</kbd> 단축키 또는 도구 탭에서 원클릭으로 활성화.
- Figma 감성의 섬세한 십자선 헤어라인이 마우스 커서를 따라다니며, 커서 옆 뱃지에 실시간 `X: 420 Y: 680 <button>` 픽셀 좌표와 현재 호버 중인 DOM 태그 및 클래스명을 표시.

### 5. 🔤 가독성 극대화 오버레이 뱃지 & 타이포그래피 위계
- **확대된 안내 텍스트**: 인스펙팅 안내 텍스트를 `12px` / `700 Bold`로 대폭 키우고 화이트 보더와 짙은 드롭섀도우를 부여하여 밝은 배경과 어두운 배경 어디서든 선명한 가독성 보장.
- **스튜디오 폰트 위계**: 플로팅 독 전반의 버튼 라디우스는 캡슐 반원(`9999px`)을 배제하고 단정한 모던 스퀘어클(`6px` ~ `8px`) 디자인 엄격 적용.

### 6. 🔍 피그마 감성 인스턴트 줌인 / 줌아웃 (Instant Zoom)
- **비대칭 가속도 곡선 줌**: <kbd>Z</kbd> 키를 꾹 누르고 있으면 마우스 커서 위치를 중심으로 부드럽고 실키하게 깊은 줌인(2.4x 배율, 520ms 감속 곡선)이 진행됩니다.
- **쾌속 원복 줌아웃**: 손을 떼는 순간 줌인보다 2.6배 빠른 스내피 줌아웃(200ms 곡선)으로 원래 배율로 순식간에 복귀.
- **브라우저 노멀 줌과의 차별화**: 브라우저 레이아웃을 깨뜨리는 <kbd>Ctrl</kbd> + <kbd>+</kbd>/<kbd>-</kbd> 노멀 줌과 달리, 페이지 레이아웃 변형 없이 마우스 위치의 디테일과 픽셀을 순간적으로 확대해 볼 수 있는 피그마 돋보기 경험.

### 7. 📐 다중 단위 거리 측정 & 스마트 룰러 (Multi-Unit Engine)
- `px`, `rem`, `em`, `%`, `vw`, `vh`, `pt` 자유로운 단위 스위치.
- 스마트 룰러 듀얼 뱃지(`1.5rem (24px)`)로 요소 간 여백 시각화.
- Margin / Padding 박스 모델 시각적 조절 슬라이더.

### 8. ⚡ 인터랙션 탐지기 & WebGL 텔레메트리 & 파워 툴
- **가상 클래스 고정**: `:hover`, `:active`, `:focus` 강제 고정.
- **자바스크립트 이벤트 해부**: 요소에 등록된 이벤트 리스너 코드 확인.
- **WebGL/Canvas GPU 분석**: 실제 GPU 벤더/렌더러, VRAM 추정치, 해상도 버퍼 검사.
- **복사/우클릭 차단 해제 (<kbd>Alt</kbd>+<kbd>U</kbd>)**: 불펌 방지 스크립트 즉시 무력화.
- **스크립트 프리징 (<kbd>Alt</kbd>+<kbd>F</kbd>)**: 마우스 떼면 사라지는 툴팁/드롭다운 고정.
- **애니메이션 슬로우모션**: `0.1x` ~ `2.0x` 글로벌 모션 속도 제어 & Cubic-Bezier 곡선 시각화.
- **스마트 코드 추출**: Tailwind CSS 클래스 변환, Clean CSS 규칙, 번들 CSS Beautifier.

---

## 🚀 Chrome 브라우저 설치 및 사용법 (Installation Guide)

### 방법 1. 릴리즈 ZIP 파일로 설치 (가장 추천)
1. 본 리포지토리의 [Releases](https://github.com/hslcrb/style-scrather/releases) 페이지에서 최신 `style-scrather-v4.0.3.zip` 파일을 다운로드합니다.
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저 주소창에 `chrome://extensions` 를 입력하고 이동합니다.
4. 우측 상단의 **'개발자 모드(Developer mode)'** 토글 스위치를 켭니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다(Load unpacked)'** 버튼을 클릭합니다.
6. 압축을 해제한 폴더를 선택하면 설치가 완료됩니다!

### 방법 2. 저장소 복제하여 직접 로드
```bash
# 1. 저장소 클론
git clone https://github.com/hslcrb/style-scrather.git
cd style-scrather

# 2. Chrome 브라우저에서 'chrome://extensions' 접속
# 3. '개발자 모드' 활성화 -> '압축해제된 확장 프로그램을 로드합니다' 클릭
# 4. style-scrather 폴더 선택
```

---

## ⌨️ 단축키 및 컨트롤 (Shortcuts Cheatsheet)

| 단축키 / 동작 | 기능 설명 |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>S</kbd> | **Style Scratcher 인스펙터 켜기 / 끄기 토글** (미주입 탭 자동 인젝션) |
| <kbd>Alt</kbd> + <kbd>C</kbd> | **정밀 십자선 커서 & (X, Y) 실시간 좌표 가이드 토글** |
| <kbd>Z</kbd> **(꾹 누름)** | **인스턴트 줌인** (마우스 커서 중심 520ms 줌인, 손 떼면 200ms 쾌속 줌아웃) |
| <kbd>Ctrl</kbd> + <kbd>+</kbd> / <kbd>-</kbd> | **브라우저 노멀 줌** (표준 브라우저 레이아웃 확대/축소) |
| <kbd>Alt</kbd> + <kbd>F</kbd> | **화면 & 툴팁 프리징 (Freeze)** (사라지는 호버 팝업 고정) |
| <kbd>Alt</kbd> + <kbd>U</kbd> | **복사 & 우클릭 차단 원클릭 무력화** |
| **마우스 좌클릭** | 특정 요소 선택 및 고정 (Lock) - **안전 모드로 링크 이동 원천 차단** |
| **마우스 호버** | 고정된 요소와 마우스 요소 간의 픽셀/단위 거리 측정 |
| <kbd>Esc</kbd> | 현재 선택된 요소 고정 해제 (Unlock) |
| **플로팅 독 헤더 드래그** | 화면 원하는 위치로 자유롭게 스튜디오 창 이동 |
| **최소화 버튼** | 컴팩트 바 형태로 축소 / 확장 |

---

## 🧪 로컬 데모 테스트베드 구동

```bash
# 로컬 정적 서버 구동
node serve.js

# 브라우저에서 아래 URL 접속
http://localhost:3000/demo/index.html
```

---

## 📄 라이선스 (License)

Copyright 2024-2026 Rheehose (Rhee Creative) / Hose Rhee (이호세).

Licensed under the **Apache License, Version 2.0** (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
