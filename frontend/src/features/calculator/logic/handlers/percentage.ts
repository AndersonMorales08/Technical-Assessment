import { toRaw } from "../format";
import type { Operator } from "../operators";
import type { CalculatorState } from "../types";

const isAdditive = (operator: Operator | null): boolean =>
  operator === "+" || operator === "-";

/**
 * Como en una calculadora de bolsillo:
 * - "200 + 10 %" → 10 % *de 200* (= 20), y luego "=" da 220.
 * - En cualquier otro caso, divide entre 100.
 */
export function percentage(state: CalculatorState): CalculatorState {
  const value = Number(state.current);
  const result =
    state.previous !== null && isAdditive(state.operator)
      ? (state.previous * value) / 100
      : value / 100;

  return { ...state, current: toRaw(result), awaiting: false, overwrite: true };
}
