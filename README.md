# Style Scratcher (스타일 스크래처) v2.0

<div align="center">

![Style Scratcher Logo](icons/icon128.png)

### 🎨 디자이너와 프론트엔드 개발자의 애환을 종결짓는 차세대 웹 인스펙터 & 실시간 CSS 튜너

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](#)
[![Version](https://img.shields.io/badge/Version-v2.0.0-blueviolet.svg)](#)
[![Design](https://img.shields.io/badge/Design-White%20Minimal%20Studio-black.svg)](#)

</div>

---

## 📌 Style Scratcher v2.0 소개

기존 브라우저 개발자 도구(DevTools)의 수많은 상속 스타일과 난해한 난독화 클래스(`.css-x98k1`)에 지치셨나요?

**Style Scratcher v2.0**은 웹 화면을 **피그마(Figma) 캔버스**처럼 다룰 수 있게 해주는 고성능 화이트 미니멀 Chrome 브라우저 확장 프로그램(Manifest V3)입니다. 

v2.0에서는 **다중 단위(rem, em, %, vw/vh, pt) 거리 측정**, **자바스크립트 이벤트 리스너 & :hover 가상 클래스 강제 토글**, **WebGL GPU 하드웨어 텔레메트리**, **우클릭/복사 방지 무력화**, **애니메이션 0.1x 슬로우모션 컨트롤러**까지 탑재된 올인원 웹 리버스 엔지니어링 & 스타일 샌드박스로 진화했습니다.

---

## ✨ v2.0 핵심 기능 (Key Features)

### 1. 📐 다중 단위 거리 측정 엔진 (Multi-Unit Measurement)
- **자유로운 단위 스위치**: `px` 뿐만 아니라 타이포그래피/반응형 단위인 `rem`, `em`, `%`, `vw`, `vh`, `pt`로 즉시 환산.
- **피그마 스마트 룰러**: 요소를 클릭해 고정한 뒤 다른 요소 위에 마우스를 올리면 실시간으로 상·하·좌·우 간격이 `1.5rem (24px)` 형태의 듀얼 뱃지로 표시됩니다.
- **박스 모델 단위 연동**: Margin과 Padding의 시각적 박스 모델에서도 선택된 단위로 즉시 변환.

### 2. ⚡ 인터랙션 & JS 이벤트 리스너 탐지기 (Interaction Detector)
- **가상 클래스 강제 고정 (Force Pseudo-State)**: 마우스를 떼도 `:hover`, `:active`, `:focus` 상태를 강제로 활성화하여 드롭다운 및 호버 애니메이션 스타일을 안전하게 검사/수정.
- **자바스크립트 이벤트 핸들러 해부**: 선택한 요소에 걸려있는 `click`, `mouseenter`, `keydown` 등 모든 이벤트 리스너 목록과 핸들러 소스 코드를 인스펙트.

### 3. 🎮 WebGL & Canvas / SVG 심층 그래픽 분석 (Graphics Telemetry)
- **캔버스 하드웨어 스펙 조회**: `<canvas>` 선택 시 렌더링 컨텍스트(`WebGL 2.0`, `WebGL 1.0`, `Canvas 2D`), 실제 버퍼 크기 vs CSS 표시 크기, 레티나 선명도(DPR), 추정 VRAM 점유율 계산.
- **GPU 렌더러 식별**: 마스킹 해제된 실제 그래픽카드 칩셋 이름(NVIDIA, AMD, Apple M series 등), GL 버전, 쉐이딩 언어, 지원 확장 수 파악.
- **SVG 구조 인스펙터**: `viewBox`, 패스(`path`) 개수, 기본 도형 및 그래디언트 분석.

### 4. 🔓 복사/우클릭 차단 무력화 & 툴팁 프리징 (Power Tools)
- **원클릭 복사 차단 해제**: `user-select: none !important`와 `contextmenu`, `selectstart`, `copy` 방지 스크립트를 즉시 무력화하여 막혀있던 웹사이트의 텍스트를 자유롭게 복사.
- **스크립트 & 툴팁 프리징 (Freeze)**: <kbd>Alt</kbd> + <kbd>F</kbd>를 누르면 마우스를 떼는 순간 사라져 버리는 툴팁, 모달, 호버 팝업을 화면에 그대로 정지시켜 스타일을 자유롭게 검사.

### 5. 🎬 애니메이션 슬로우모션 & 모션 인스펙터 (Motion Lab)
- **글로벌 재생 속도 제어**: Web Animations API 기반으로 사이트 전체의 CSS 애니메이션 및 트랜지션을 `0.1x` (극저속), `0.25x`, `0.5x`, `1.0x`, `2.0x`로 조절하여 프레임 단위로 점검.
- **Cubic-Bezier 가속도 곡선 시각화**: `ease-in-out`, `cubic-bezier(...)` 타이밍 함수의 가속도 곡선을 SVG 그래프로 실시간 렌더링.
- **애니메이션 일시정지 / 재개**: 프레임을 멈춰놓고 정밀 스타일 측정 가능.

### 6. 🎨 화이트 미니멀 스튜디오 디자인 (White Minimal Studio)
- **정갈한 순백색 미학**: Figma, Linear 감성의 순백색(`#FFFFFF`), 소프트 마이크로 보더(`#E5E7EB`), 정교한 다크 모노스페이스 폰트 스택.
- **절제된 버튼 라디우스 (Anti-Pill 규격)**: 캡슐형/완전 반원(`border-radius: 9999px`)을 배제하고, 단정하고 단단한 모던 `6px` ~ `8px` 스퀘어클을 엄격히 적용.
- **Shadow DOM 완벽 격리**: 방문한 웹사이트의 CSS와 인스펙터 간의 상호 오염을 100% 원천 차단.

### 7. 🚀 스마트 코드 추출 & CSS 난독화 해제
- **Tailwind CSS 자동 변환**: 인스펙트한 요소의 스타일을 `rounded-md p-4 bg-white text-gray-900 shadow-md` 등 Tailwind 유틸리티 클래스로 즉시 변환.
- **Clean CSS 규칙 생성**: 브라우저 기본값 수백 개를 걸러낸 정제된 클린 CSS 규칙 추출.
- **CSS De-minifier**: 한 줄로 뭉쳐진 번들 CSS를 2-space 들여쓰기로 완벽하게 미화 및 초고속 검색.

---

## 🚀 Chrome 브라우저 설치 및 사용법 (Installation Guide)

### 방법 1. 릴리즈 ZIP 파일로 설치 (가장 간편한 방법)
1. 본 리포지토리의 [Releases](https://github.com/hslcrb/style-scrather/releases) 페이지에서 최신 `style-scrather-v2.0.0.zip` 파일을 다운로드합니다.
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저 주소창에 `chrome://extensions` 를 입력하고 이동합니다.
4. 우측 상단의 **'개발자 모드(Developer mode)'** 토글을 켭니다.
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
| <kbd>Alt</kbd> + <kbd>S</kbd> | Style Scratcher 인스펙터 켜기 / 끄기 |
| <kbd>Alt</kbd> + <kbd>F</kbd> | **화면 & 툴팁 프리징 (Freeze)** (사라지는 호버 팝업 고정) |
| <kbd>Alt</kbd> + <kbd>U</kbd> | **복사 & 우클릭 차단 원클릭 해제** |
| **마우스 좌클릭** | 특정 요소 선택 및 고정 (Lock) |
| **마우스 호버** | 고정된 요소와 마우스 요소 간의 픽셀/단위 거리 측정 |
| <kbd>Esc</kbd> | 현재 선택된 요소 고정 해제 (Unlock) |
| **플로팅 독 헤더 드래그** | 화면 원하는 위치로 자유롭게 창 이동 |
| **최소화 버튼** | 컴팩트 바 형태로 축소 / 확장 |

---

## 🧪 로컬 데모 테스트베드 구동

WebGL 3D 큐브, 애니메이션 슬로우모션, 복사 차단 무력화 기능을 웹 애플리케이션 형태로 즉시 시연할 수 있습니다.

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
