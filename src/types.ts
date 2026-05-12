export type FlowType =
  | "rss"
  | "atom"
  | "jsonfeed";

export interface Flow {
  type: FlowType;
  url: string;
}

export interface QRXResult {
  flows: Flow[];
}