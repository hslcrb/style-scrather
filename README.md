# Style Scratcher (스타일 스크래처)

<div align="center">

![Style Scratcher Logo](icons/icon128.png)

### 🎨 디자이너와 프론트엔드 개발자의 애환을 해결하는 차세대 웹 인스펙터 & 실시간 CSS 튜너

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](#)
[![Design](https://img.shields.io/badge/Design-White%20Minimal-black.svg)](#)
[![Version](https://img.shields.io/badge/Version-v1.0.0-blueviolet.svg)](#)

</div>

---

## 📌 왜 Style Scratcher 인가요?

기존 브라우저 개발자 도구(DevTools)는 기능이 방대하지만 디자이너와 프론트엔드 개발자가 원하는 직관적인 시각적 경험과는 거리가 멀었습니다.
- **수백 줄의 상속 기본값**: 내가 실제로 준 `padding`과 `radius`를 찾으려면 스크롤을 한참 내려야 합니다.
- **번들링과 난독화**: 한 줄로 뭉쳐진 난해한 CSS 클래스(`.css-9fk3x`) 때문에 실제 디자인 스펙 파악이 어렵습니다.
- **번거로운 간격 확인**: 요소 간 간격을 재려면 박스 모델을 일일이 암산해야 합니다.

**Style Scratcher**는 웹 브라우저를 마치 **피그마(Figma) 캔버스**처럼 바꿔줍니다. 마우스 호버만으로 요소 간 거리가 픽셀(px) 단위로 측정되고, 라디우스와 마진, 패딩을 실시간으로 조작하며, 난독화된 CSS를 즉시 미화하여 확인할 수 있습니다.

---

## ✨ 핵심 기능 (Key Features)

### 1. 피그마 스마트 룰러 (Figma Distance Rulers)
- **정밀 픽셀 거리 측정**: 요소를 클릭하여 고정한 뒤 다른 요소 위에 마우스를 올리면 피그마(Alt 키)처럼 상·하·좌·우 픽셀 간격(px) 가이드라인과 빨간색 측정 뱃지가 실시간으로 그려집니다.
- **12컬럼 & 8px 베이스라인 그리드**: 웹사이트 정렬 체계와 수직 리듬을 한눈에 점검할 수 있는 반응형 오버레이 그리드를 제공합니다.

### 2. 화이트 미니멀 스튜디오 디자인 (White Minimal Studio)
- **클린 룩앤필**: Figma/Linear 느낌의 정갈한 화이트(`#FFFFFF`) 배경과 소프트 마이크로 보더(`#E5E7EB`).
- **단정한 버튼 라디우스 (Anti-Pill 규격)**: 사용자의 요청에 따라 캡슐형/완전 반원(`border-radius: 9999px`)을 배제하고, 절제되고 단단한 모던 `6px` ~ `8px` 스퀘어클을 적용했습니다.
- **Shadow DOM 완벽 격리**: 방문한 웹사이트의 CSS가 인스펙터 UI에 전혀 영향을 주지 않고, 인스펙터 또한 웹사이트 스타일을 훼손하지 않습니다.

### 3. 실시간 스타일 트위커 & 샌드박스 (Live Tweaker)
- **Border Radius 실시간 조작**: 통합 슬라이더/인풋 및 4모서리(TL, TR, BL, BR) 개별 곡률 조절.
- **인터랙티브 박스 모델**: Margin과 Padding을 시각 다이어그램에서 직접 확인하고 슬라이더로 즉시 조절.
- **컬러 & 타이포그래피**: 배경색, 글자색, 테두리색(컬러피커/HEX)과 폰트 크기/굵기를 웹 화면에서 즉각 변경.
- **원클릭 초기화 (Reset)**: 수정한 모든 스타일을 원래 상태로 1초 만에 복구.

### 4. 스마트 코드 추출 & Tailwind 변환
- **Tailwind CSS 자동 변환**: 인스펙트한 요소의 스타일을 분석하여 `rounded-md p-4 bg-white text-gray-900 shadow-md` 등 모던 Tailwind 유틸리티 클래스로 즉시 변환.
- **Clean CSS 규칙 생성**: 브라우저 기본값 수백 개를 제외하고 실제 의미 있는 핵심 규칙만 깔끔한 CSS 블록으로 추출.
- **HTML 구조 원클릭 복사**: Outer HTML 및 태그 속성 즉시 클립보드 복사.

### 5. 사이트 CSS 난독화 해제 & 컬러 팔레트 추출기
- **CSS De-minifier**: 한 줄로 뭉쳐진 압축/난독화 CSS를 2-space 들여쓰기와 표준 개행으로 완벽하게 미화.
- **스타일시트 초고속 검색**: 사이트 내 모든 스타일시트에서 클래스, 셀렉터, 속성을 실시간으로 검색.
- **사이트 전체 컬러 & 폰트 분석**: 사이트에 사용된 모든 고유 색상(HEX)을 등장 빈도순으로 집계하여 원클릭 복사 제공.

---

## 🚀 Chrome 브라우저 설치 및 사용법 (Installation Guide)

### 방법 A. 릴리즈 ZIP 파일로 설치하기 (가장 간편한 방법)
1. 본 리포지토리의 [Releases](https://github.com/hslcrb/style-scrather/releases) 페이지에서 최신 `style-scrather-v1.0.0.zip` 파일을 다운로드합니다.
2. 다운로드한 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저 주소창에 `chrome://extensions` 를 입력하고 이동합니다.
4. 우측 상단의 **'개발자 모드(Developer mode)'** 토글을 켭니다.
5. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다(Load unpacked)'** 버튼을 클릭합니다.
6. 압축을 해제한 폴더를 선택하면 설치가 완료됩니다!

### 방법 B. 소스 코드로 직접 빌드 / 로드하기
```bash
# 1. 저장소 복제
git clone https://github.com/hslcrb/style-scrather.git
cd style-scrather

# 2. Chrome 브라우저에서 'chrome://extensions' 접속
# 3. '개발자 모드' 활성화 -> '압축해제된 확장 프로그램을 로드합니다' 클릭
# 4. style-scrather 폴더 선택
```

---

## ⌨️ 단축키 및 인터랙션 안내 (Shortcuts)

| 단축키 / 동작 | 설명 |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>S</kbd> | Style Scratcher 인스펙터 켜기 / 끄기 토글 |
| **마우스 좌클릭** | 특정 요소 선택 및 고정 (Lock) |
| **마우스 호버** | 고정된 요소와 현재 마우스 요소 간의 픽셀 거리(px) 측정 |
| <kbd>Esc</kbd> | 현재 선택된 요소 고정 해제 (Unlock) |
| **헤더 드래그** | 플로팅 독을 화면 원하는 위치로 자유롭게 이동 |
| **최소화 버튼** | 플로팅 독을 컴팩트 헤더로 축소 / 확장 |

---

## 🧪 로컬 데모 테스트베드 구동

익스텐션을 브라우저에 등록하기 전에도 로컬 서버를 통해 즉시 웹 애플리케이션 형태로 시연 및 테스트할 수 있습니다.

```bash
# 로컬 정적 서버 실행
node serve.js

# 브라우저에서 아래 URL 접속
http://localhost:3000/demo/index.html
```

---

## 📂 프로젝트 구조

```
style-scrather/
├── manifest.json                     # Chrome Extension Manifest V3 설정
├── icons/                            # 16, 48, 128 크기 PNG 아이콘
├── background/
│   └── service-worker.js             # 백그라운드 단축키 및 탭 통신 워커
├── popup/
│   ├── popup.html                    # 익스텐션 팝업 UI
│   ├── popup.css                     # 팝업 화이트 미니멀 CSS
│   └── popup.js                      # 팝업 인터랙션 제어
├── content/
│   ├── content.js                    # 메인 오케스트레이터 (Shadow DOM 주입)
│   ├── overlay-canvas.js             # 피그마 가이드라인, 스마트 룰러, 12컬럼 그리드
│   ├── style-tweaker.js              # 실시간 스타일 조작 샌드박스 및 리셋
│   ├── tailwind-converter.js         # CSS to Tailwind 변환 엔진
│   ├── css-beautifier.js             # CSS 난독화 해제 및 스타일시트 파서
│   ├── palette-extractor.js          # 사이트 컬러 및 폰트 집계기
│   ├── components/
│   │   └── floating-dock.js          # 드래그 가능한 플로팅 HUD 컴포넌트
│   └── styles/
│       └── shadow-styles.css         # Shadow DOM 전용 스튜디오 스타일시트
├── demo/
│   └── index.html                    # SaaS 인터랙티브 테스트베드
├── test/
│   └── verify.js                     # 6개 영역 자동 검증 테스트
├── LICENSE                           # Apache License 2.0
├── README.md                         # 공식 문서
└── serve.js                          # 테스트베드 로컬 HTTP 서버
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
