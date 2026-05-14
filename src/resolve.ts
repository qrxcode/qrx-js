// src/resolve.ts

import { detectFlows } from "./detect";

import type { QRXResult } from "./types";

export async function resolveQRX(
  url: string
): Promise<QRXResult> {
  const response = await fetch(url);

  const html = await response.text();

  const flows = detectFlows(
    html,
    response.url
  );

  return {
    flows
  };
}