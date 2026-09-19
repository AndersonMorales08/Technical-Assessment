import { ZERO } from "../constants";
import type { CalculatorState } from "../types";

export function deleteLast(state: CalculatorState): CalculatorState {
  if (state.overwrite) return state; // no se borran resultados

  const remaining = state.current.slice(0, -1);
  const isEmpty = remaining === "" || remaining === "-";

  return { ...state, current: isEmpty ? ZERO : remaining };
}
