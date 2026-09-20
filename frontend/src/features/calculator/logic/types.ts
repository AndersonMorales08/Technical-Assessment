import type { Operator } from "./operators";

/** Cálculo enviado al servidor, más lo que hay que hacer con su respuesta. */
export type PendingCalculation =
  /** "=": muestra el resultado. */
  | { kind: "evaluate"; operator: Operator; left: number; right: number }
  /** Operador encadenado (2 + 3 ×): el resultado pasa a ser el operando izquierdo de `next`. */
  | { kind: "chain"; operator: Operator; left: number; right: number; next: Operator }
  | { kind: "sqrt"; value: number }
  /** `base` solo existe tras + o −: "200 + 10 %" pide el 10 % *de 200*. */
  | { kind: "percent"; value: number; base: number | null };

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
  /** Mientras exista, se espera la respuesta del servidor y la calculadora está ocupada. */
  pending: PendingCalculation | null;
}

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "sqrt" }
  | { type: "percent" }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "calculationSucceeded"; value: number }
  | { type: "calculationFailed"; message: string };

/** Lo que se le pide al servidor (independiente del formato concreto del endpoint). */
export type CalculationRequest =
  | { kind: "binary"; operator: Operator; left: number; right: number }
  | { kind: "sqrt"; value: number }
  | { kind: "percent"; value: number; base: number | null };

/** Contrato que la calculadora espera; la implementación HTTP vive en api/. */
export interface CalculationService {
  /** Devuelve el resultado o lanza `CalculationError` con un mensaje apto para el usuario. */
  calculate(request: CalculationRequest, signal?: AbortSignal): Promise<number>;
}
