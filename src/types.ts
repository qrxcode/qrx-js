// /src/types.ts

export type FlowType =
  | "feed"
  | "qrx";

export type FlowSource =
  | "html"
  | "http";

export interface Flow {
  flowType: FlowType;
  rel: string;
  href: string;
  type: string;
  source: FlowSource;
}

export interface QRXResult {
  flows: Flow[];
}