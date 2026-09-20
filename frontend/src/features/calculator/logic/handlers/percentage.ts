import { requestCalculation } from "../helpers";
import type { Operator } from "../operators";
import type { CalculatorState } from "../types";

const isAdditive = (operator: Operator | null): boolean =>
  operator === "+" || operator === "-";

/**
 * Como en una calculadora de bolsillo:
 * - "200 + 10 %" → 10 % *de 200* (= 20), y luego "=" da 220.
 * - En cualquier otro caso, el servidor divide entre 100 (`base` es null).
 */
export function percentage(state: CalculatorState): CalculatorState {
  const base = isAdditive(state.operator) ? state.previous : null;

  return requestCalculation(state, {
    kind: "percent",
    value: Number(state.current),
    base,
  });
}
