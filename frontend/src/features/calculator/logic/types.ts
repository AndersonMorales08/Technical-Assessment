import type { Operator } from "./operators";

export interface CalculatorState {
  /** Número que se escribe o se muestra, en formato interno ("1234.5"). */
  current: string;
  /** Operando izquierdo de la operación pendiente. */
  previous: number | null;
  operator: Operator | null;
  /** Se acaba de elegir un operador y falta el segundo operando. */
  awaiting: boolean;
  /** El próximo dígito empieza un número nuevo. */
  overwrite: boolean;
  /** Línea secundaria de la pantalla ("12 + 3 ="). */
  expression: string;
  error: string | null;
}

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "sqrt" }
  | { type: "percent" }
  | { type: "backspace" }
  | { type: "clear" };

export type CalculationResult = { value: number } | { error: string };
