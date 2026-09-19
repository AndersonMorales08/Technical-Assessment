import { ERROR_MESSAGES } from "./constants";
import { OPERATIONS, type Operator } from "./operators";
import type { CalculationResult } from "./types";

export function calculate(left: number, operator: Operator, right: number): CalculationResult {
  const { apply, validate } = OPERATIONS[operator];

  const validationError = validate?.(left, right);
  if (validationError) return { error: validationError };

  const value = apply(left, right);
  return Number.isFinite(value) ? { value } : { error: ERROR_MESSAGES.invalidResult };
}
