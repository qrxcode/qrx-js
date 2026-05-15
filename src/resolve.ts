// src/resolve.ts

import {
  detectFlows,
  detectFlowsFromLinkHeader
} from "./detect";

import type { QRXResult } from "./types";

export async function resolveQRX(
  url: string
): Promise<QRXResult> {
  const response = await fetch(url);

  const sourceUrl = response.url;

  const headerFlows = detectFlowsFromLinkHeader(
    response.headers.get("link"),
    sourceUrl
  );

  const html = await response.text();

  const htmlFlows = detectFlows(
    html,
    sourceUrl
  );

  return {
    flows: [
      ...headerFlows,
      ...htmlFlows
    ]
  };
}