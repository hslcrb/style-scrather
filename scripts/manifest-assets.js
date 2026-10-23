// One manifest contract shared by syntax checks and the packaged-file allowlist.
function validateManifestAssets(manifest, files) {
  const icons = value => typeof value === 'string' ? [value] : Object.values(value || {});
  const patterns = [
    manifest.background?.service_worker, manifest.action?.default_popup,
    ...icons(manifest.icons), ...icons(manifest.action?.default_icon),
    ...(manifest.content_scripts || []).flatMap(group => [...(group.js || []), ...(group.css || [])]),
    ...(manifest.web_accessible_resources || []).flatMap(group => group.resources || [])
  ].filter(Boolean);
  const matched = new Set();
  for (const pattern of patterns) {
    if (typeof pattern !== 'string' || pattern.startsWith('/') || /[\\\u0000-\u001f]/.test(pattern) ||
        pattern.split('/').some(part => !part || part.startsWith('.'))) {
      throw new Error(`Invalid manifest asset path: ${pattern}`);
    }
    const escaped = pattern.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    const matcher = new RegExp(`^${escaped}$`);
    const matches = files.filter(file => matcher.test(file));
    if (!matches.length) throw new Error(`Missing manifest asset: ${pattern}`);
    for (const file of matches) matched.add(file);
  }
  return [...matched];
}

module.exports = { validateManifestAssets };
