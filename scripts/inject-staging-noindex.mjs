// When STAGING=true (set by Netlify for branch-deploy and deploy-preview
// contexts), inject `<meta name="robots" content="noindex,nofollow">` into
// every prerendered index.html and replace robots.txt with a blanket
// Disallow. Production builds skip this and ship the canonical site.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = 'dist/TypeFast';
const NOINDEX_META = '<meta name="robots" content="noindex,nofollow" />';
const STAGING_ROBOTS = 'User-agent: *\nDisallow: /\n';

if (process.env.STAGING !== 'true') {
  console.log('inject-staging-noindex: STAGING != true, skipping');
  process.exit(0);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (name === 'index.html' || name === '404.html') {
      out.push(full);
    }
  }
  return out;
}

let patched = 0;
for (const file of walk(DIST_DIR)) {
  const html = readFileSync(file, 'utf8');
  if (html.includes('name="robots"')) continue; // already has one
  const next = html.replace(/<head>/i, `<head>\n    ${NOINDEX_META}`);
  if (next !== html) {
    writeFileSync(file, next);
    patched++;
  }
}

writeFileSync(join(DIST_DIR, 'robots.txt'), STAGING_ROBOTS);

console.log(
  `inject-staging-noindex: STAGING=true → ${patched} HTML file(s) noindexed, robots.txt rewritten to Disallow: /`,
);
