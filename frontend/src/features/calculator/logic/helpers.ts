import { pendingExpression } from "./expression";
import { toRaw } from "./format";
import { initialState } from "./initialState";
import type { Operator } from "./operators";
import type { CalculatorState, PendingCalculation } from "./types";
import { validate } from "./validation";

/** Estado de error: el resto de la calculadora vuelve a cero. */
export const failWith = (message: string): CalculatorState => ({
  ...initialState,
  error: message,
});

/** Empieza a escribir un número nuevo, conservando la operación pendiente. */
export function startNewNumber(state: CalculatorState, current: string): CalculatorState {
  return {
    ...state,
    current,
    overwrite: false,
    awaiting: false,
    // Con una operación pendiente se conserva ("12 +"); tras un resultado se limpia.
    expression: state.operator ? state.expression : "",
  };
}

/** Fija `left` como operando izquierdo y queda a la espera del segundo número. */
export function startOperation(
  state: CalculatorState,
  left: number,
  operator: Operator,
): CalculatorState {
  return {
    ...state,
    current: toRaw(left),
    previous: left,
    operator,
    awaiting: true,
    overwrite: true,
    expression: pendingExpression(left, operator),
  };
}

/**
 * Pide un cálculo al servidor: el reducer solo anota QUÉ hay que calcular
 * (`pending`) y quien hace la petición es el hook useCalculator.
 */
export function requestCalculation(
  state: CalculatorState,
  pending: PendingCalculation,
): CalculatorState {
  const error = validate(pending);
  return error ? failWith(error) : { ...state, pending };
}
