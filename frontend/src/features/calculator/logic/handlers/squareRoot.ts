import { ERROR_MESSAGES } from "../constants";
import { sqrtExpression } from "../expression";
import { toRaw } from "../format";
import { failWith } from "../helpers";
import type { CalculatorState } from "../types";

export function squareRoot(state: CalculatorState): CalculatorState {
  const value = Number(state.current);
  if (value < 0) return failWith(ERROR_MESSAGES.negativeRoot);

  return {
    ...state,
    current: toRaw(Math.sqrt(value)),
    awaiting: false,
    overwrite: true,
    // Con una operación pendiente se conserva su expresión.
    expression: state.operator ? state.expression : sqrtExpression(value),
  };
}
