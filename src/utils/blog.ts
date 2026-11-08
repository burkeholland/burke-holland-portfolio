import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (first, second) =>
      second.data.pubDate.getTime() - first.data.pubDate.getTime(),
  );
}

export function getMarkdownBody(post: BlogPost): string {
  if (typeof post.body !== "string") {
    throw new Error(`Blog post "${post.id}" is missing its Markdown body.`);
  }
  return post.body;
}

export function getReadingMinutes(body: string): number {
  const wordCount = body.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 220));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}
