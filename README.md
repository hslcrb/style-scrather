# Style Scratcher (스타일 스크래처) v3.0.0

<div align="center">

![Style Scratcher Logo](icons/icon128.png)

### 🎨 디자이너와 프론트엔드 개발자의 애환을 종결짓는 차세대 웹 인스펙터 & 실시간 에셋 스튜디오

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](#)
[![Version](https://img.shields.io/badge/Version-v3.0.0-blueviolet.svg)](#)
[![Design](https://img.shields.io/badge/Design-White%20Minimal%20Studio-black.svg)](#)

</div>

---

## 📌 Style Scratcher v3.0.0 소개

기존 브라우저 개발자 도구(DevTools)의 수많은 상속 스타일과 난해한 난독화 클래스(`.css-x98k1`), 그리고 인스펙팅 도중 링크를 잘못 눌러 다른 페이지로 튕겨 나가는 불편함에 지치셨나요?

**Style Scratcher**는 웹 브라우저 화면을 **피그마(Figma) 캔버스 겸 라이브 에디터 스튜디오**처럼 자유롭게 다룰 수 있게 해주는 고성능 화이트 미니멀 Chrome 브라우저 확장 프로그램(Manifest V3)입니다.

v3.0.0에서는 **실시간 에셋(텍스트/이미지/SVG) 편집기**, **스포이트 & 감각적 컬러 스위트**, **안전 검사 모드(클릭 무효화)**, **정밀 십자선 커서**, **가독성을 극대화한 오버레이 타이포그래피**가 대대적으로 추가되었습니다.

### 🏷️ 버전 관리 체계 (Semantic Versioning)
Style Scratcher는 표준 3자리 버전 체계(`Major.Minor.Patch`)를 엄격히 준수합니다.
- **Major (첫 번째 자리)**: 아키텍처 및 핵심 패러다임이 바뀌는 대규모 릴리즈 (v3.0.0)
- **Minor (두 번째 자리)**: 핵심 신규 기능 및 주요 사용자 경험 확장
- **Patch (세 번째 자리)**: 세부 버그 픽스 및 미세 성능 최적화

---

## ✨ v3.0.0 신규 및 핵심 기능 (Features)

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

### 5. 🔤 가독성 극대화 오버레이 뱃지 & 타이포그래피 위계 정립
- **확대된 안내 텍스트**: 기존에 너무 작아 잘 보이지 않던 인스펙팅 안내 텍스트를 `12px` / `700 Bold`로 대폭 키우고, 화이트 보더와 짙은 드롭섀도우를 부여하여 밝은 배경과 어두운 배경 어디서든 압도적인 가독성 보장.
- **스튜디오 폰트 위계**: 플로팅 독 전반의 섹션 타이틀, 레이블, 수치 입력 필드에 통일된 폰트 위계와 스퀘어클(`6px` ~ `8px`, 캡슐 반원 배제) 디자인 적용.

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
1. 본 리포지토리의 [Releases](https://github.com/hslcrb/style-scrather/releases) 페이지에서 최신 `style-scrather-v3.0.0.zip` 파일을 다운로드합니다.
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
| <kbd>Alt</kbd> + <kbd>S</kbd> | **Style Scratcher 인스펙터 켜기 / 끄기 토글** |
| <kbd>Alt</kbd> + <kbd>C</kbd> | **정밀 십자선 커서 & (X, Y) 실시간 좌표 가이드 토글 (v3.0.0)** |
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

WebGL 3D 큐브, 실시간 에셋 편집, 스포이트 컬러 스위트, 인스턴트 줌, 애니메이션 슬로우모션, 복사 차단 무력화 기능을 웹 애플리케이션 형태로 즉시 시연할 수 있습니다.

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
