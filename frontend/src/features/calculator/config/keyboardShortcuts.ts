import { isOperator, type CalculatorAction } from "../logic";

const SHORTCUTS = new Map<string, CalculatorAction>([
  [",", { type: "decimal" }],
  [".", { type: "decimal" }],
  ["Enter", { type: "equals" }],
  ["=", { type: "equals" }],
  ["%", { type: "percent" }],
  ["r", { type: "sqrt" }],
  ["R", { type: "sqrt" }],
  // "^" es una tecla muerta en muchos teclados en español, por eso también "P".
  ["p", { type: "operator", operator: "^" }],
  ["P", { type: "operator", operator: "^" }],
  ["Backspace", { type: "backspace" }],
  ["Escape", { type: "clear" }],
  ["Delete", { type: "clear" }],
]);

/** Traduce el valor de `KeyboardEvent.key` a una acción (o null si no aplica). */
export function keyToAction(key: string): CalculatorAction | null {
  if (/^\d$/.test(key)) return { type: "digit", digit: key };
  if (isOperator(key)) return { type: "operator", operator: key };

  return SHORTCUTS.get(key) ?? null;
}
