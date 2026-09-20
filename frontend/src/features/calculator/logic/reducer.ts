import { applyResult } from "./handlers/applyResult";
import { chooseOperator } from "./handlers/chooseOperator";
import { deleteLast } from "./handlers/deleteLast";
import { evaluate } from "./handlers/evaluate";
import { inputDecimal } from "./handlers/inputDecimal";
import { inputDigit } from "./handlers/inputDigit";
import { percentage } from "./handlers/percentage";
import { squareRoot } from "./handlers/squareRoot";
import { failWith } from "./helpers";
import { initialState } from "./initialState";
import type { CalculatorAction, CalculatorState } from "./types";

/** Tras un error solo se puede volver a empezar escribiendo un número. */
const recoversFromError = (action: CalculatorAction): boolean =>
  action.type === "digit" || action.type === "decimal";

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  // Estas acciones siempre se atienden: AC cancela incluso un cálculo en curso.
  switch (action.type) {
    case "clear":
      return initialState;
    case "calculationSucceeded":
      return applyResult(state, action.value);
    case "calculationFailed":
      // Sin cálculo en curso es una respuesta tardía: se ignora.
      return state.pending ? failWith(action.message) : state;
  }

  if (state.pending) return state; // ocupada: espera la respuesta del servidor
  if (state.error && !recoversFromError(action)) return state;

  const base = state.error ? initialState : state;

  switch (action.type) {
    case "digit":     return inputDigit(base, action.digit);
    case "decimal":   return inputDecimal(base);
    case "operator":  return chooseOperator(base, action.operator);
    case "equals":    return evaluate(base);
    case "sqrt":      return squareRoot(base);
    case "percent":   return percentage(base);
    case "backspace": return deleteLast(base);
  }
}
