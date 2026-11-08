# Burke Holland Portfolio

An Astro static portfolio and Markdown blog. The home page (`/`) presents the portfolio; the blog index (`/blog/`) and individual `/blog/<slug>` pages are generated from the blog content collection. Project cards use verified project data.

## Content

- `src/data/profile.ts` contains profile data.
- `src/data/projects.ts` contains verified project data.
- `src/content/blog/` contains Markdown posts. Each post requires `title`, `description`, `pubDate` (publication date), and `author` (the byline); `tags` are optional.

`draft` defaults to `false`, so set `draft: true` while writing; only non-drafts are published. `example` defaults to `false`. Example posts use `example: true` and `author: Example content`, and keep their sample label in the blog and feed. Replace or remove all example posts before presenting the site as Burke's writing.

## Local development

Use Node.js 22.x and npm. From the repository root:

```sh
npm ci
```

Start the development server:

```sh
npm run dev
```

Run checks and build the production site:

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
