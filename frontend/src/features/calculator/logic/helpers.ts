import { initialState } from "./initialState";
import type { CalculatorState } from "./types";

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
