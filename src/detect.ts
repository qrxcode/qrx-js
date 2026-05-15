// /src/detect.ts

import type { Flow } from "./types";

const FEED_TYPES = new Set([
  "application/rss+xml",
  "application/atom+xml",
  "application/feed+json"
]);

export function detectFlows(
  html: string,
  sourceUrl: string
): Flow[] {
  const flows: Flow[] = [];

  const linkTagRegex = /<link\s+[^>]*>/gi;

  const tags = html.match(linkTagRegex) || [];

  for (const tag of tags) {
    const rel = getAttribute(tag, "rel");
    const type = getAttribute(tag, "type");
    const href = getAttribute(tag, "href");

    if (!rel || !type || !href) {
      continue;
    }

    const normalizedRel = rel.trim();
    const normalizedType = type.trim().toLowerCase();

    if (!hasRel(normalizedRel, "alternate")) {
      continue;
    }

    if (!FEED_TYPES.has(normalizedType)) {
      continue;
    }

    flows.push({
      flowType: "feed",
      rel: normalizedRel,
      href: new URL(href, sourceUrl).toString(),
      type: normalizedType
    });
  }

  return flows;
}

function getAttribute(
  tag: string,
  attribute: string
): string | null {
  const regex = new RegExp(
    `${attribute}\\s*=\\s*["']([^"']+)["']`,
    "i"
  );

  const match = tag.match(regex);

  return match ? match[1] : null;
}

function hasRel(
  rel: string,
  expected: string
): boolean {
  return rel
    .toLowerCase()
    .split(/\s+/)
    .includes(expected);
}