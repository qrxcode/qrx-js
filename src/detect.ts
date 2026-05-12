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

    if (!rel || !type || !href) continue;

    if (!rel.includes("alternate")) continue;

    const flowType = FLOW_TYPES[type];

    if (!flowType) continue;

    flows.push({
      type: flowType,
      url: new URL(href, sourceUrl).toString()
    });
  }

  return dedupeFlows(flows);
}

function getAttribute(
  tag: string,
  attribute: string
): string | null {
  const regex = new RegExp(
    `${attribute}=["']([^"']+)["']`,
    "i"
  );

  const match = tag.match(regex);

  return match ? match[1] : null;
}

function dedupeFlows(flows: Flow[]): Flow[] {
  const seen = new Set<string>();

  return flows.filter((flow) => {
    const key = `${flow.type}:${flow.url}`;

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });
}