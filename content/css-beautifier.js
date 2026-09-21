// Style Scratcher - CSS Beautifier & Site Stylesheet Extractor

class CssBeautifier {
  /**
   * Format and de-minify raw CSS string into readable, indented CSS
   * @param {string} rawCss 
   * @param {number} indentSize 
   * @returns {string}
   */
  static beautify(rawCss, indentSize = 2) {
    if (!rawCss || typeof rawCss !== 'string') return '';

    const indent = ' '.repeat(indentSize);
    let level = 0;
    let formatted = '';
    
    // Normalize whitespace and remove comments safely
    let css = rawCss
      .replace(/\r\n/g, '\n')
      .replace(/\/\*[\s\S]*?\*\//g, (match) => `\n${match}\n`); // preserve comments on their own lines

    // Tokenize by special characters: { } ;
    let inString = false;
    let stringChar = '';
    let buffer = '';

    for (let i = 0; i < css.length; i++) {
      const ch = css[i];

      // Handle quotes (strings inside content: "..." or url(...))
      if ((ch === '"' || ch === "'") && css[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = ch;
        } else if (stringChar === ch) {
          inString = false;
        }
        buffer += ch;
        continue;
      }

      if (inString) {
        buffer += ch;
        continue;
      }

      const formatDecl = (decl) => {
        const colonIdx = decl.indexOf(':');
        if (colonIdx !== -1 && !decl.startsWith('@import')) {
          const prop = decl.slice(0, colonIdx).trim();
          const val = decl.slice(colonIdx + 1).trim();
          return indent.repeat(level) + `${prop}: ${val};\n`;
        }
        return indent.repeat(level) + decl + (decl.endsWith(';') ? '' : ';') + '\n';
      };

      if (ch === '{') {
        const trimmed = buffer.trim();
        buffer = '';
        if (trimmed) {
          formatted += (formatted.endsWith('\n') || formatted === '' ? '' : '\n') +
                       indent.repeat(level) + trimmed + ' {\n';
        } else {
          formatted += ' {\n';
        }
        level++;
      } else if (ch === '}') {
        const trimmed = buffer.trim();
        buffer = '';
        if (trimmed) {
          formatted += formatDecl(trimmed);
        }
        level = Math.max(0, level - 1);
        formatted += indent.repeat(level) + '}\n\n';
      } else if (ch === ';') {
        const trimmed = buffer.trim();
        buffer = '';
        if (trimmed) {
          formatted += formatDecl(trimmed);
        }
      } else {
        buffer += ch;
      }
    }

    const remaining = buffer.trim();
    if (remaining) {
      formatted += indent.repeat(level) + remaining + '\n';
    }

    // Clean up excessive blank lines
    return formatted.replace(/\n{3,}/g, '\n\n').trim();
  }

  /**
   * Extract all active CSS rules from document stylesheets
   * @returns {Promise<Array<{ source: string, rulesCount: number, css: string }>>}
   */
  static async extractSiteStylesheets() {
    const results = [];
    const sheets = Array.from(document.styleSheets);

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      let sourceName = '인라인 <style>';
      if (sheet.href) {
        try {
          const url = new URL(sheet.href);
          sourceName = url.pathname.split('/').pop() || url.host;
        } catch {
          sourceName = sheet.href;
        }
      }

      let rawCss = '';
      let rulesCount = 0;

      try {
        if (sheet.cssRules) {
          rulesCount = sheet.cssRules.length;
          const rules = Array.from(sheet.cssRules);
          rawCss = rules.map(r => r.cssText).join('\n');
        }
      } catch (corsErr) {
        // Cross-origin stylesheet access restricted by browser security
        // Attempt fetch if CORS permits
        if (sheet.href && sheet.href.startsWith('http')) {
          try {
            const res = await fetch(sheet.href, { mode: 'cors' });
            if (res.ok) {
              rawCss = await res.text();
            }
          } catch (fetchErr) {
            rawCss = `/* [보안 정책 알림] 외부 도메인 스타일시트 (${sheet.href})는 브라우저 CORS 정책으로 인해 실시간 파싱이 제한되었습니다. */`;
          }
        }
      }

      if (rawCss) {
        results.push({
          source: sourceName,
          fullHref: sheet.href || 'inline',
          rulesCount: rulesCount || 1,
          css: this.beautify(rawCss)
        });
      }
    }

    // Also parse any <style> tags in document that might not be in styleSheets yet
    const inlineTags = document.querySelectorAll('style:not([data-style-scratcher])');
    inlineTags.forEach((tag, idx) => {
      if (tag.textContent && tag.textContent.trim()) {
        const text = tag.textContent.trim();
        // Check if already in results
        const exists = results.some(r => r.css.includes(text.slice(0, 50)));
        if (!exists) {
          results.push({
            source: `인라인 <style #${idx + 1}>`,
            fullHref: 'inline',
            rulesCount: (text.match(/\{/g) || []).length,
            css: this.beautify(text)
          });
        }
      }
    });

    return results;
  }
}

// Attach to window / global scope
if (typeof window !== 'undefined') {
  window.CssBeautifier = CssBeautifier;
}
