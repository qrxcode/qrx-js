// /src/select.ts

import type {
  Flow,
  FlowType
} from "./types";

export function selectFlowsByFlowType(
  flows: Flow[],
  preferredFlowTypes: FlowType[]
): Flow[] {
  return flows.filter((flow) =>
    preferredFlowTypes.includes(
      flow.flowType
    )
  );
}