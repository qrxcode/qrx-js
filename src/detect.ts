// /src/detect.ts

import type { Flow, FlowSource } from "./types";

const FEED_TYPES = new Set([
  "application/rss+xml",
  "application/atom+xml",
  "application/feed+json"
]);

interface LinkCandidate {
  rel: string | null;
  href: string | null;
  type: string | null;
}

export function detectFlows(
  html: string,
  sourceUrl: string
): Flow[] {
  const candidates = extractHtmlLinkCandidates(html);

  return candidates
    .map((candidate) =>
      detectFlowCandidate(candidate, sourceUrl, "html")
    )
    .filter((flow): flow is Flow => flow !== null);
}

export function detectFlowsFromLinkHeader(
  linkHeader: string | null,
  sourceUrl: string
): Flow[] {
  if (!linkHeader) {
    return [];
  }

  const candidates = extractHttpLinkCandidates(linkHeader);

  return candidates
    .map((candidate) =>
      detectFlowCandidate(candidate, sourceUrl, "http")
    )
    .filter((flow): flow is Flow => flow !== null);
}

export function detectFlowCandidate(
  candidate: LinkCandidate,
  sourceUrl: string,
  source: FlowSource
): Flow | null {
  const { rel, type, href } = candidate;

  if (!rel || !href) {
    return null;
  }

  const normalizedRel = rel.trim();

  if (!normalizedRel) {
    return null;
  }

  const resolvedHref = new URL(
    href,
    sourceUrl
  ).toString();

  if (normalizedRel === "qrx") {
    if (!type) {
      return null;
    }

    return {
      flowType: "qrx",
      rel: normalizedRel,
      href: resolvedHref,
      type: type.trim().toLowerCase(),
      source
    };
  }

  if (!type) {
    return null;
  }

  const normalizedType = type.trim().toLowerCase();

  if (!hasRel(normalizedRel, "alternate")) {
    return null;
  }

  if (!FEED_TYPES.has(normalizedType)) {
    return null;
  }

  return {
    flowType: "feed",
    rel: normalizedRel,
    href: resolvedHref,
    type: normalizedType,
    source
  };
}

function extractHtmlLinkCandidates(
  html: string
): LinkCandidate[] {
  const linkTagRegex = /<link\s+[^>]*>/gi;
  const tags = html.match(linkTagRegex) || [];

  return tags.map((tag) => ({
    rel: getAttribute(tag, "rel"),
    type: getAttribute(tag, "type"),
    href: getAttribute(tag, "href")
  }));
}

function extractHttpLinkCandidates(
  linkHeader: string
): LinkCandidate[] {
  return splitLinkHeader(linkHeader)
    .map(parseHttpLinkValue)
    .filter(
      (candidate): candidate is LinkCandidate =>
        candidate !== null
    );
}

function parseHttpLinkValue(
  value: string
): LinkCandidate | null {
  const hrefMatch = value.match(/^\s*<([^>]+)>/);

  if (!hrefMatch) {
    return null;
  }

  const candidate: LinkCandidate = {
    href: hrefMatch[1],
    rel: null,
    type: null
  };

  const paramRegex =
    /;\s*([a-zA-Z][a-zA-Z0-9_-]*)\s*=\s*"([^"]*)"/g;

  let match: RegExpExecArray | null;

  while ((match = paramRegex.exec(value)) !== null) {
    const name = match[1].toLowerCase();
    const paramValue = match[2];

    if (name === "rel") {
      candidate.rel = paramValue;
    }

    if (name === "type") {
      candidate.type = paramValue;
    }
  }

  return candidate;
}

function splitLinkHeader(
  linkHeader: string
): string[] {
  return linkHeader
    .split(/,\s*(?=<)/)
    .map((part) => part.trim())
    .filter(Boolean);
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