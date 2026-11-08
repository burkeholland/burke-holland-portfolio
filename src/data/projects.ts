export const projects = [
  {
    name: "Anvil",
    description: "Evidence-first coding agent for GitHub Copilot CLI.",
    href: "https://github.com/burkeholland/anvil",
    art: "anvil",
  },
  {
    name: "Markdoc",
    description:
      "Google Docs for Markdown: realtime collaborative markdown editor with comments, suggestions, versions, and GitHub-backed storage.",
    href: "https://github.com/burkeholland/markdoc",
    art: "markdoc",
  },
  {
    name: "Mirror Me",
    description:
      "A self-contained Windows app for mirroring your iPhone over AirPlay. Built with Go and Wails.",
    href: "https://github.com/burkeholland/mirror-me",
    art: "mirror-me",
  },
] as const;

export type Project = (typeof projects)[number];
