# Privacy and permissions

Style Scratcher inspects and edits the page in the user's browser. It does not include an analytics SDK, an account system, an AI service, or a backend that receives inspected page content.

## Data that stays local

Selection state, generated CSS/JSX, color analysis, layout measurements and temporary edits are processed in the browser. Clipboard writes and file downloads happen when the user requests them. Shortcut preferences and update-check cache are stored locally; the exact storage mechanism is visible in the corresponding modules.

Do not interpret the absence of a product backend as an absence of all network traffic.

## Network requests

| Action | Destination / purpose |
| --- | --- |
| Check for updates | GitHub API, to read the latest release metadata |
| Read external stylesheets or download a font | The asset's original host, subject to browser access and the implemented limits |
| Use the optional sample-image replacement tool | An Unsplash image host |
| Open documentation, source, a release or installation link | The destination chosen by the user |

The extension does not send the inspected DOM or page text to those services for analysis. Requests to another host still disclose ordinary request metadata such as IP address. Generated code can contain user-selected page text and URLs; review it before sharing.

## Chrome permissions

| Permission | Why it is present |
| --- | --- |
| `activeTab` | User-directed access to the current tab |
| `scripting` | Recover injection on pages without a content-script receiver |
| `storage` | Extension-local settings/cache where used |
| `<all_urls>` host access | Inspection of ordinary web pages and resource fetching across permitted origins |

Chrome's own protected-page rules still apply. File URL access is controlled by the extension's browser settings. A narrower optional-permission architecture is a possible future change; this refresh retains the existing host-permission model.

## Controls and limits

Inspection starts on demand. Close the studio to stop inspection and restore temporary interaction modes. Reload the page to discard all local page edits. Remove the extension in Chrome's extension settings when no longer needed.

See [Security](../SECURITY.md) for private vulnerability reporting and [Verification](VERIFICATION.md) for the tested environment and known limitations.
