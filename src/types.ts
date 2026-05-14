// /src/types.ts

export type FlowType =
  | "rss"
  | "atom"
  | "jsonfeed";

export interface Flow {
  flowType: FlowType;
  rel: string;
  href: string;
  type: string;
}

export interface QRXResult {
  flows: Flow[];
}