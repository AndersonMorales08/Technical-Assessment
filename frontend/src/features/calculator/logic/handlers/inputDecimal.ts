import { startNewNumber } from "../helpers";
import type { CalculatorState } from "../types";

export function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.overwrite) return startNewNumber(state, "0.");
  if (state.current.includes(".")) return state;

  return { ...state, current: `${state.current}.` };
}
