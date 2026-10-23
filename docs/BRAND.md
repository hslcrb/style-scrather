# Style Scratcher · Brand system

## A closer look, a deliberate change

**Style Scratcher** (스타일 스크래처) is a browser inspection studio for people who care how the web is made. Its voice is direct, curious, and precise. Lead with what someone can inspect or change. Explain the scope of an action and state limitations in ordinary language.

Use **Style Scratcher** in interfaces and prose. `style-scrather` is the existing repository/package spelling; keep it in URLs and paths for compatibility. The refresh is `v4.1.0.` in visible interface copy, `4.1.0` in machine-readable versions, and `v4.1.0` as a Git tag. The [GitHub release](https://github.com/hslcrb/style-scrather/releases/tag/v4.1.0) provides the verified extension ZIP and checksum. A GitHub release does not imply a Chrome Web Store listing. Verify a publication before advertising its download link.

## Mark

The four crimson brackets preserve the original selection-box identity. Short outward guides connect it to measurement. The center point represents a deliberate selection. Open edges give the mark breathing room without changing its meaning.

| Asset | Use |
| --- | --- |
| `icons/mark.svg` | Transparent mark on light surfaces; navigation and interface headers. `website/icons/mark.svg` is its generated deployment mirror. |
| `icons/app-icon.svg` | Mark on a pearl app tile |
| `icons/wordmark.svg` | Horizontal name-and-mark lockup; accessible system-font SVG text |
| `icons/social-card.svg` | Editable 1200 × 630 project sharing artwork |
| `icons/icon16.png`, `icon48.png`, `icon128.png` | Chrome manifest assets, supersampled for small sizes |

Keep at least one center-point diameter of clear space around the mark. Do not stretch, rotate, recolor individual brackets, or place it on a visually busy image. Use the app tile when a background is unpredictable. The SVG wordmark uses Arial/Helvetica fallbacks; use live text with the product system-font stack in interfaces.

Run `node scripts/generate-icons.js` (or the compatible `node generate-icons.js`) from any working directory. The dependency-free generator writes every listed asset. Its SVG paths and antialiased PNG renderer share a normalized 64 × 64 geometry; no external image service, font download, or graphics package is needed. Generated artwork belongs to this Apache-2.0 project.

## Color

| Token | Value | Role |
| --- | --- | --- |
| Studio Crimson | `#E11D48` | Brand mark, selection, primary action |
| Crimson hover | `#BE123C` | Hovered primary action, accent text on pearl |
| Crimson active | `#9F1239` | Pressed primary action |
| Ink | `#17151C` | Main text and dark editorial sections |
| Pearl | `#F5F4F1` | Canvas and quiet backgrounds |
| Paper | `#FFFFFF` | Foreground surfaces |
| Muted | `#626773` | Supporting text on light surfaces |
| Rose wash | `#FFF1F2` | Selection tint and subtle emphasis |
| Hairline | `rgba(23, 21, 28, .12)` | Separators and neutral borders |

Crimson should identify an action or selected state. It should not wash every surface. Small accent text uses the darker hover shade when needed for contrast. Error, success, and warning information must include words or an icon in addition to color.

## Liquid Studio interface

Glass is a material for a floating tool, not a reason to sacrifice contrast. Use a nearly opaque pearl surface, a fine inner highlight, a restrained shadow, and modest backdrop blur. Supply a solid fallback through `@supports`. Avoid heavy saturation, excessive gradient layers, and motion that competes with the page being inspected.

Use system fonts with a Korean fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif`. Give Korean headlines natural word boundaries and generous line height. Code uses a system monospace stack. Do not use downloaded fonts, decorative text images, or unreadably small labels to achieve density.

Every control needs a visible keyboard focus state and a descriptive accessible name. Follow the user's reduced-motion preference. Show the current state in words. Preserve readable text and functional controls when transparency or animation is unavailable.

## Writing

Primary product copy is Korean, with selective English labels for familiar concepts. Prefer “요소를 선택하고 CSS를 확인하세요” over inflated promises. Distinguish the website preview from the installed extension. Explain local edits as temporary and exports as starting points that need review. Do not promise exact reconstruction, universal site support, AI generation, guaranteed safety, or unverified performance.

The public project remains **Apache-2.0**, copyright 2024–2026 Rheehose (Rhee Creative) / Hose Rhee (이호세).
