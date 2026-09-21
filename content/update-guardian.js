// Style Scratcher v4.0.2. - GitHub Release Auto-Detection & One-Click Update Guardian

class UpdateGuardian {
  constructor(options = {}) {
    this.repo = options.repo || 'hslcrb/style-scrather';
    this.currentVersion = options.currentVersion || '4.0.2';
    this.apiUrl = `https://api.github.com/repos/${this.repo}/releases/latest`;
    this.cacheKey = 'style_scrather_update_cache';
    this.cacheTtlMs = 1000 * 60 * 30; // 30 minutes cache
    this.lastResult = null;
  }

  /**
   * Parse version string into numeric components [major, minor, patch]
   * Handles formats like "v4.0.2", "v4.0.2.", "4.0.2", "4.0.1"
   */
  static parseVersion(verStr) {
    if (!verStr || typeof verStr !== 'string') return [0, 0, 0];
    const cleaned = verStr.replace(/^v/i, '').replace(/\.+$/, '');
    const parts = cleaned.split('.').map(p => parseInt(p, 10) || 0);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  }

  /**
   * Returns true if vA is strictly newer than vB
   */
  static isNewer(verA, verB) {
    const [a1, a2, a3] = UpdateGuardian.parseVersion(verA);
    const [b1, b2, b3] = UpdateGuardian.parseVersion(verB);

    if (a1 !== b1) return a1 > b1;
    if (a2 !== b2) return a2 > b2;
    return a3 > b3;
  }

  /**
   * Format version into strict user-facing dot notation standard (vX.Y.Z.)
   */
  static formatDisplayVersion(verStr) {
    const [maj, min, patch] = UpdateGuardian.parseVersion(verStr);
    return `v${maj}.${min}.${patch}.`;
  }

  /**
   * Check GitHub Releases for newer version
   * @param {boolean} forceRefresh - Ignore cache if true
   * @returns {Promise<Object>} Update info
   */
  async checkForUpdate(forceRefresh = false) {
    try {
      // Check cache if not forcing refresh
      if (!forceRefresh && typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < this.cacheTtlMs) {
              this.lastResult = parsed.data;
              return parsed.data;
            }
          } catch (e) {
            // ignore cache parse error
          }
        }
      }

      const response = await fetch(this.apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: HTTP ${response.status}`);
      }

      const release = await response.json();
      const latestTag = release.tag_name || '';
      const hasUpdate = UpdateGuardian.isNewer(latestTag, this.currentVersion);

      // Find zip asset if available
      let zipUrl = '';
      if (release.assets && Array.isArray(release.assets)) {
        const zipAsset = release.assets.find(a => a.name.endsWith('.zip'));
        if (zipAsset) zipUrl = zipAsset.browser_download_url;
      }
      if (!zipUrl && release.zipball_url) {
        zipUrl = release.zipball_url;
      }

      const result = {
        success: true,
        hasUpdate,
        currentVersion: this.currentVersion,
        currentDisplayVersion: UpdateGuardian.formatDisplayVersion(this.currentVersion),
        latestVersion: latestTag.replace(/^v/i, '').replace(/\.+$/, ''),
        latestDisplayVersion: UpdateGuardian.formatDisplayVersion(latestTag),
        releaseTitle: release.name || latestTag,
        releaseNotes: release.body || '',
        releaseUrl: release.html_url || `https://github.com/${this.repo}/releases`,
        zipUrl,
        publishedAt: release.published_at || ''
      };

      this.lastResult = result;

      // Save to cache
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(this.cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: result
          }));
        } catch (e) {}
      }

      return result;
    } catch (err) {
      console.warn('[UpdateGuardian] Error checking update:', err.message);
      return {
        success: false,
        error: err.message,
        hasUpdate: false,
        currentVersion: this.currentVersion,
        currentDisplayVersion: UpdateGuardian.formatDisplayVersion(this.currentVersion),
        releaseUrl: `https://github.com/${this.repo}/releases`
      };
    }
  }

  /**
   * Programmatically trigger downloading the update ZIP asset
   */
  triggerDownload(zipUrl, filename) {
    if (!zipUrl) {
      window.open(`https://github.com/${this.repo}/releases/latest`, '_blank');
      return;
    }

    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = filename || `style-scrather-update.zip`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 100);
  }
}

if (typeof window !== 'undefined') {
  window.UpdateGuardian = UpdateGuardian;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UpdateGuardian;
}
