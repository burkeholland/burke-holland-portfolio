import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { BASE_PATH, SITE_URL } from "./src/config/site";

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: "always",
  output: "static",
  integrations: [sitemap()],
});
