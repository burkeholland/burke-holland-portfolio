import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const basePath = "/burke-holland-portfolio";
const siteOrigin = "https://burkeholland.github.io";
const publicRoutes = [
  ["home", "index.html"],
  ["about", "about/index.html"],
  ["projects", "projects/index.html"],
  ["blog archive", "blog/index.html"],
  ["first post", "blog/grounded-cli-review/index.html"],
  ["second post", "blog/base-aware-static-links/index.html"],
];

async function readRoute(route) {
  return readFile(join(dist, route), "utf8");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : path;
    }),
  );
  return nested.flat();
}

function assertMetadata(html, route) {
  assert.match(html, /<title>[^<]+<\/title>/u, `${route} has a title`);
  const description = html.match(
    /<meta name="description" content="([^"]+)"/u,
  )?.[1];
  assert.ok(description?.trim(), `${route} has a description`);

  const canonical = html.match(
    /<link rel="canonical" href="([^"]+)"/u,
  )?.[1];
  assert.ok(canonical, `${route} has a canonical URL`);
  const canonicalUrl = new URL(canonical);
  assert.equal(canonicalUrl.origin, siteOrigin);
  assert.ok(
    canonicalUrl.pathname.startsWith(`${basePath}/`),
    `${route} canonical URL includes the project base`,
  );

  const image = html.match(
    /<meta property="og:image" content="([^"]+)"/u,
  )?.[1];
  assert.ok(image, `${route} has an Open Graph image`);
  assert.ok(
    new URL(image).pathname.startsWith(`${basePath}/`),
    `${route} Open Graph image includes the project base`,
  );
  assert.match(html, /<meta property="og:image:type" content="image\/png"/u);
  const twitterImage = html.match(
    /<meta name="twitter:image" content="([^"]+)"/u,
  )?.[1];
  assert.equal(twitterImage, image);
}

function assertInternalUrlsUseBase(html, route) {
  const urls = [...html.matchAll(/\b(?:href|src)="([^"]+)"/gu)].map(
    (match) => match[1],
  );

  for (const url of urls) {
    if (/^(?:https?:|mailto:|tel:|#|data:)/iu.test(url)) continue;
    assert.ok(
      url.startsWith(`${basePath}/`),
      `${route} contains an unprefixed local URL: ${url}`,
    );
  }
}

test("published routes render base-aware URLs and complete metadata", async () => {
  for (const [label, route] of publicRoutes) {
    const html = await readRoute(route);
    assertMetadata(html, label);
    assertInternalUrlsUseBase(html, label);
  }

  const notFound = await readRoute("404.html");
  assert.match(notFound, /<meta name="robots" content="noindex, nofollow"/u);
  assert.doesNotMatch(notFound, /<link rel="canonical"/u);
  assertInternalUrlsUseBase(notFound, "404");
});

test("the social card is a shipped 1200x630 PNG", async () => {
  const image = await readFile(join(dist, "social-card.png"));
  assert.equal(image.toString("hex", 0, 8), "89504e470d0a1a0a");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);

  const home = await readRoute("index.html");
  const socialImage = home.match(
    /<meta property="og:image" content="([^"]+)"/u,
  )?.[1];
  assert.ok(socialImage);
  assert.equal(
    new URL(socialImage).pathname,
    `${basePath}/social-card.png`,
  );
});

test("primary button hover text meets WCAG contrast in light and dark themes", async () => {
  const css = await readFile(
    new URL("../src/styles/global.css", import.meta.url),
    "utf8",
  );
  const hoverRule = css.match(/\.button--primary:hover\s*\{([^}]+)\}/u)?.[1];
  assert.ok(hoverRule, "primary button has a hover rule");
  assert.match(hoverRule, /background:\s*var\(--accent\)/u);
  assert.match(hoverRule, /color:\s*var\(--accent-foreground\)/u);

  const themes = [
    ["light", css.match(/^:root\s*\{([^}]+)\}/mu)?.[1]],
    [
      "dark preference",
      css.match(/^:root\[data-theme="dark"\]\s*\{([^}]+)\}/mu)?.[1],
    ],
    [
      "dark system default",
      css.match(
        /@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]+)\}/u,
      )?.[1],
    ],
  ];

  const getColor = (block, variable) => {
    const color = block.match(
      new RegExp(`${variable}:\\s*(#[\\da-f]{6})`, "iu"),
    )?.[1];
    assert.ok(color, `${variable} is declared for the theme`);
    return color;
  };
  const luminance = (color) => {
    const channels = [1, 3, 5].map(
      (offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255,
    );
    const linear = channels.map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };

  for (const [theme, block] of themes) {
    assert.ok(block, `${theme} colors are declared`);
    const background = luminance(getColor(block, "--accent"));
    const foreground = luminance(getColor(block, "--accent-foreground"));
    const contrast =
      (Math.max(background, foreground) + 0.05) /
      (Math.min(background, foreground) + 0.05);
    assert.ok(contrast >= 4.5, `${theme} hover contrast is ${contrast.toFixed(2)}:1`);
  }
});

test("the homepage identifies Burke and About keeps the example disclosure", async () => {
  const home = await readRoute("index.html");
  const about = await readRoute("about/index.html");

  assert.match(home, /<h1>Burke Holland<\/h1>/u);
  assert.match(about, /<h1>About Burke Holland<\/h1>/u);
  assert.match(
    about,
    /Based in Franklin, Tennessee, Burke Holland is associated with Microsoft/u,
  );
  assert.doesNotMatch(about, /A few details, clearly sourced|public profile lists/u);
  assert.match(about, /Example post/u);
  assert.match(about, /Example content/u);
});

test("project links include their visible text in the accessible name", async () => {
  const projects = await readRoute("projects/index.html");
  const links = [
    ...projects.matchAll(
      /<a class="project-card__link"[^>]*aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gu,
    ),
  ];

  assert.ok(links.length > 0, "project links are rendered");
  for (const [, accessibleName, visibleText] of links) {
    assert.match(accessibleName, /View repository/u);
    assert.match(visibleText, /View repository/u);
  }
});

test("system theme changes resync the toggle until an explicit theme is chosen", async () => {
  const layout = await readFile(
    new URL("../src/layouts/SiteLayout.astro", import.meta.url),
    "utf8",
  );

  assert.match(
    layout,
    /systemColorScheme\.addEventListener\("change",\s*\(\) => \{\s*if \(!document\.documentElement\.dataset\.theme\)\s*\{\s*syncThemeButton\(\);/u,
  );
});

test("example posts are labeled and credited on home, archive, and detail", async () => {
  const home = await readRoute("index.html");
  const archive = await readRoute("blog/index.html");
  const article = await readRoute("blog/grounded-cli-review/index.html");
  const homeCards = [...home.matchAll(/<article class="post-card">([\s\S]*?)<\/article>/gu)]
    .map((match) => match[1]);

  assert.ok(homeCards.length > 0, "home shows published writing");
  for (const card of homeCards.filter((html) => /Example post/u.test(html))) {
    assert.match(card, /Example content/u);
  }
  assert.match(archive, /Example post/u);
  assert.match(archive, /Example content/u);
  assert.match(article, /Example post/u);
  assert.match(article, /Example content/u);
  assert.match(article, /Demonstration content, not a post authored by Burke Holland/u);
  assert.match(article, /\d+ min read/u);
});

test("drafts are absent from routes, published pages, RSS, and sitemap", async () => {
  const draftRoute = join(dist, "blog", "draft-only", "index.html");
  await assert.rejects(readFile(draftRoute), { code: "ENOENT" });

  const [home, archive, feed] = await Promise.all([
    readRoute("index.html"),
    readRoute("blog/index.html"),
    readRoute("rss.xml"),
  ]);
  const sitemapFiles = (await listFiles(dist)).filter((path) =>
    /sitemap[^\\]*\.xml$/iu.test(path),
  );
  assert.ok(sitemapFiles.length > 0, "sitemap XML is generated");
  const sitemap = (await Promise.all(
    sitemapFiles.map((path) => readFile(path, "utf8")),
  )).join("\n");
  const publishedOutput = `${home}\n${archive}\n${feed}\n${sitemap}`;

  assert.doesNotMatch(publishedOutput, /Unpublished example for draft-route checks/u);
});

test("RSS preserves sample labels, bylines, dates, and base-prefixed routes", async () => {
  const feed = await readRoute("rss.xml");
  const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/gu)].map(
    (match) => match[1],
  );

  assert.ok(items.length >= 2, "RSS includes the example entries");
  const exampleItems = items.filter((item) =>
    /<title>Example post:/u.test(item),
  );
  assert.ok(exampleItems.length >= 2);
  for (const item of items) {
    assert.match(item, /<dc:creator[^>]*>[^<]+<\/dc:creator>/u);
    const link = item.match(/<link>([^<]+)<\/link>/u)?.[1];
    assert.ok(link, "RSS item has a link");
    const itemUrl = new URL(link);
    assert.equal(itemUrl.origin, siteOrigin);
    assert.ok(itemUrl.pathname.startsWith(`${basePath}/blog/`));

    const pubDate = item.match(/<pubDate>([^<]+)<\/pubDate>/u)?.[1];
    assert.ok(pubDate && Number.isFinite(Date.parse(pubDate)));
  }
  for (const item of exampleItems) {
    assert.match(item, /Example content/u);
  }
  assert.match(feed, /<language>en-us<\/language>/u);
});

test("the sitemap contains only published, base-prefixed routes", async () => {
  const sitemapFiles = (await listFiles(dist)).filter((path) =>
    /sitemap[^\\]*\.xml$/iu.test(path),
  );
  const sitemap = (await Promise.all(
    sitemapFiles.map((path) => readFile(path, "utf8")),
  )).join("\n");

  assert.match(sitemap, /burkeholland\.github\.io\/burke-holland-portfolio/u);
  assert.match(sitemap, /grounded-cli-review/u);
  assert.doesNotMatch(sitemap, /draft-only|Unpublished example/u);
});
