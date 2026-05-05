import { copyFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ORIGIN = 'https://typefast.io';
const DIST_DIR = 'dist/TypeFast';

const PRIORITY_BY_PATH = {
  '/': { priority: '1.0', changefreq: 'weekly' },
  '/test': { priority: '0.9', changefreq: 'weekly' },
  '/about': { priority: '0.7', changefreq: 'monthly' },
  '/how-it-works': { priority: '0.7', changefreq: 'monthly' },
  '/tips': { priority: '0.7', changefreq: 'monthly' },
  '/contribute': { priority: '0.5', changefreq: 'monthly' },
  '/changelog': { priority: '0.3', changefreq: 'weekly' },
  '/privacy': { priority: '0.3', changefreq: 'yearly' },
  '/terms': { priority: '0.3', changefreq: 'yearly' },
  '/feedback': { priority: '0.3', changefreq: 'yearly' },
};
const DEFAULT_ENTRY = { priority: '0.5', changefreq: 'monthly' };

// Routes that prerender to HTML but should NOT be advertised in the sitemap.
const SITEMAP_EXCLUDE = new Set(['/404']);

function findIndexHtmlFiles(dir, root = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...findIndexHtmlFiles(full, root));
    } else if (name === 'index.html') {
      const rel = relative(root, full);
      const dirPath = rel === 'index.html' ? '/' : '/' + rel.slice(0, -'/index.html'.length);
      out.push(dirPath);
    }
  }
  return out;
}

const today = new Date().toISOString().slice(0, 10);
const allPaths = findIndexHtmlFiles(DIST_DIR).sort();
const sitemapPaths = allPaths.filter((p) => !SITEMAP_EXCLUDE.has(p));

const urls = sitemapPaths
  .map((p) => {
    const meta = PRIORITY_BY_PATH[p] ?? DEFAULT_ENTRY;
    return [
      '  <url>',
      `    <loc>${ORIGIN}${p === '/' ? '/' : p}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${meta.changefreq}</changefreq>`,
      `    <priority>${meta.priority}</priority>`,
      '  </url>',
    ].join('\n');
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(DIST_DIR, 'sitemap.xml'), xml);
console.log(
  `sitemap.xml written with ${sitemapPaths.length} URL${sitemapPaths.length === 1 ? '' : 's'}:`,
);
for (const p of sitemapPaths) console.log(`  ${ORIGIN}${p}`);

// Copy the prerendered 404 page out to a top-level 404.html so Netlify's
// `/* /404.html 404` rewrite has a target. The Angular prerender produces
// dist/TypeFast/404/index.html.
const prerendered404 = join(DIST_DIR, '404', 'index.html');
const target404 = join(DIST_DIR, '404.html');
if (existsSync(prerendered404)) {
  copyFileSync(prerendered404, target404);
  console.log(`404.html copied from ${prerendered404}`);
} else {
  console.warn(`WARNING: ${prerendered404} not found — 404.html not generated`);
}
