import { completedExpression } from "../expression";
import { toRaw } from "../format";
import { failWith } from "../helpers";
import { calculate } from "../math";
import type { CalculatorState } from "../types";

export function evaluate(state: CalculatorState): CalculatorState {
  if (state.operator === null || state.previous === null) return state;

  const right = Number(state.current);
  const result = calculate(state.previous, state.operator, right);
  if ("error" in result) return failWith(result.error);

  return {
    ...state,
    current: toRaw(result.value),
    previous: null,
    operator: null,
    awaiting: false,
    overwrite: true,
    expression: completedExpression(state.previous, state.operator, right),
  };
}
