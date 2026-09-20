import { requestCalculation } from "../helpers";
import type { CalculatorState } from "../types";

export function squareRoot(state: CalculatorState): CalculatorState {
  return requestCalculation(state, { kind: "sqrt", value: Number(state.current) });
}
