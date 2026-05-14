// /src/detect.ts

import type { Flow, FlowType } from "./types";

const FLOW_TYPES: Record<string, FlowType> = {
  "application/rss+xml": "rss",
  "application/atom+xml": "atom",
  "application/feed+json": "jsonfeed"
};

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

    const flowType = FLOW_TYPES[normalizedType];

    if (!flowType) {
      continue;
    }

    flows.push({
      flowType,
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