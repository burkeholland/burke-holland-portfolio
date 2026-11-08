---
title: "Give a static site one URL rule"
description: "A small pattern for keeping links correct when a static site lives below a repository path."
pubDate: 2026-10-16
author: "Example content"
draft: false
example: true
tags:
  - Astro
  - static sites
---

A static site may be published at a domain root or below a project path. If
navigation, canonical URLs, and feed links each construct paths differently,
one of them will eventually point somewhere unexpected.

## Centralize the prefix

Let the build configuration own the deployment base. A small helper can add
that base to every local route and public asset:

```ts
export function withBase(path: string): string {
  const prefix = import.meta.env.BASE_URL;
  return `${prefix}${path.replace(/^\/+/, "")}`;
}
```

The helper should receive site-relative paths such as `/about/` and
`/favicon.svg`. Keep external URLs separate; they should not receive the local
prefix.

## Test rendered output

Source code can look correct while the generated site contains a root-relative
link. A build smoke test can scan rendered pages for local `href` and `src`
values, then confirm that each begins with the configured project path.

The same check can cover canonical metadata, RSS item links, and sitemap
entries. Those are all public URLs, so they should follow the same rule as the
visible navigation.
