import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the delegation planner", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="ja"/i);
  assert.match(html, /<title>AIチーム委任プランナー<\/title>/i);
  assert.match(html, /その仕事、/);
  assert.match(html, /委任プランを作る/);
  assert.match(html, /外部API・入力データ送信なし/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Grok提案|朝のアプリ|火曜アプリ/);
});

test("keeps generation local and includes required role-card logic", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function buildPlan/);
  assert.match(page, /オーケストレーター/);
  assert.match(page, /ビルダー/);
  assert.match(page, /レビューガード/);
  assert.match(page, /人間確認ポイント/);
  assert.match(page, /roles\.length > 0/);
  assert.doesNotMatch(page, /\bfetch\s*\(|axios|OPENAI_API_KEY|apiKey/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(layout, /summary_large_image/);
  assert.match(layout, /\/og\.png/);
});
