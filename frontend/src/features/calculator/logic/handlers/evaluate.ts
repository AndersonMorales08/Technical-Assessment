import { requestCalculation } from "../helpers";
import type { CalculatorState } from "../types";

export function evaluate(state: CalculatorState): CalculatorState {
  if (state.operator === null || state.previous === null) return state;

  return requestCalculation(state, {
    kind: "evaluate",
    operator: state.operator,
    left: state.previous,
    right: Number(state.current),
  });
}
