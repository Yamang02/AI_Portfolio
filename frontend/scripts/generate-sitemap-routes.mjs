/**
 * 빌드 전 실행: 동적 sitemap 라우트 수집
 * - GET /api/data/projects → /projects/{id}
 * - GET /api/articles?page=0&size=2000 → /articles/{businessId}
 * 환경 변수: VITE_API_BASE_URL (없으면 빈 동적 라우트만 사용)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.VITE_API_BASE_URL || '';
const outPath = path.resolve(__dirname, '..', 'sitemap-routes.json');

const staticRoutes = ['/', '/profile', '/projects', '/articles', '/chat'];

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

async function collectDynamicRoutes() {
  const dynamic = [];

  if (!baseUrl) {
    console.warn('VITE_API_BASE_URL not set; sitemap will use static routes only.');
    return dynamic;
  }

  try {
    const projectsRes = await fetchJson(`${baseUrl}/api/data/projects`);
    const projects = projectsRes?.data ?? projectsRes ?? [];
    if (Array.isArray(projects)) {
      projects.forEach((p) => {
        if (p?.id) dynamic.push(`/projects/${p.id}`);
      });
    }
  } catch (e) {
    console.warn('Could not fetch projects for sitemap:', e.message);
  }

  try {
    const articlesRes = await fetchJson(
      `${baseUrl}/api/articles?page=0&size=2000&sortBy=publishedAt&sortOrder=desc`
    );
    const content = articlesRes?.data?.content ?? articlesRes?.content ?? [];
    if (Array.isArray(content)) {
      content.forEach((a) => {
        if (a?.businessId) dynamic.push(`/articles/${a.businessId}`);
      });
    }
  } catch (e) {
    console.warn('Could not fetch articles for sitemap:', e.message);
  }

  return dynamic;
}

async function main() {
  const dynamic = await collectDynamicRoutes();
  const routes = [...staticRoutes, ...dynamic];
  fs.writeFileSync(outPath, JSON.stringify(routes, null, 2), 'utf-8');
  console.log(
    `sitemap-routes.json written: ${staticRoutes.length} static + ${dynamic.length} dynamic = ${routes.length} routes`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
