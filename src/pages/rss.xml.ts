import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPublishedPosts } from "../utils/blog";
import { absoluteUrl } from "../utils/site";

function escapeXmlText(value: string): string {
  return value.replace(/[<>&'"]/gu, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return character;
    }
  });
}

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  return rss({
    title: "Burke Holland — Notes",
    description:
      "A Markdown archive of technical notes with dates and author labels.",
    site: absoluteUrl("/"),
    items: posts.map((post) => ({
      title: post.data.example
        ? `Example post: ${post.data.title}`
        : post.data.title,
      description: post.data.example
        ? `Example post by ${post.data.author}. ${post.data.description}`
        : post.data.description,
      pubDate: post.data.pubDate,
      link: absoluteUrl(`/blog/${post.id}/`),
      customData: `<dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${escapeXmlText(post.data.author)}</dc:creator>`,
    })),
    customData: "<language>en-us</language>",
  });
};
