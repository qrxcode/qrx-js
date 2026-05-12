import type { Flow, FlowType } from "./types";

export function selectFlows(
  flows: Flow[],
  preferredTypes: FlowType[]
): Flow[] {
  return flows.filter((flow) =>
    preferredTypes.includes(flow.type)
  );
}