# Burke Holland Portfolio

An Astro static portfolio and Markdown blog, built into `dist/`. The home page (`/`) presents a portfolio overview; `/about/` and `/projects/` provide profile and project details; `/blog/` lists posts and `/blog/<slug>/` serves each post. The site also includes an RSS feed at `/rss.xml` and a custom `404.html` not-found page.

## Content

- `src/data/profile.ts` contains profile data.
- `src/data/projects.ts` contains verified project data.
- `src/content/blog/` contains Markdown posts; `src/content.config.ts` defines their schema. Each post requires `title`, `description`, `pubDate` (publication date), and `author` (the displayed byline). `pubDate` controls newest-first ordering; `tags` are optional.

`draft` and `example` default to `false`. Set `draft: true` while writing; only non-drafts appear on the blog or in its RSS feed. Example posts set `example: true` and `author: Example content`; they are labeled as examples in the blog and feed, but are published unless also marked as drafts. Replace or remove all example posts before presenting the site as Burke's writing.

## Local development

Use Node.js 22.23.4 or newer in the Node 22 line, and npm. From the repository root:

```sh
npm ci
```

Start the development server:

```sh
npm run dev
```

Run checks, tests, and build the production site. `npm test` runs the production build and Node.js smoke tests; `npm run check` runs `astro check`.

```sh
npm run check
npm test
npm run build
npm run preview
```

Run `npm run preview` after building to preview the production output locally.

## GitHub Pages

The intended production URL, once a deployment succeeds, is <https://burkeholland.github.io/burke-holland-portfolio/>.

Before deploying, go to **Settings > Pages > Build and deployment > Source** and select **GitHub Actions**. The workflow validates pull requests without Pages being enabled. It deploys only on pushes to `main` or a manual `workflow_dispatch` run from `main`; it does not enable Pages automatically, so a build alone does not mean the site has been deployed.

The Astro production build uses `site: https://burkeholland.github.io` and `base: /burke-holland-portfolio` for this repository's project site. If moving to a custom domain, update Astro's `site` and `base` to match the domain (typically `/` at the domain root) and configure the custom domain and DNS in GitHub Pages.

This is a static site with no working email form or server-side email backend.
