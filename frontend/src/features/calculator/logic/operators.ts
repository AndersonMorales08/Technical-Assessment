import { ERROR_MESSAGES } from "./constants";

export const OPERATORS = ["+", "-", "*", "/", "^"] as const;
export type Operator = (typeof OPERATORS)[number];

interface BinaryOperation {
  /** Símbolo que se muestra en pantalla. */
  symbol: string;
  apply: (left: number, right: number) => number;
  /** Devuelve un mensaje de error si los operandos no son válidos. */
  validate?: (left: number, right: number) => string | null;
}

/**
 * Registro de operaciones binarias. Para añadir una nueva (p. ej. módulo):
 * agrégala a OPERATORS y define aquí su símbolo y su función.
 */
export const OPERATIONS: Record<Operator, BinaryOperation> = {
  "+": { symbol: "+", apply: (a, b) => a + b },
  "-": { symbol: "−", apply: (a, b) => a - b },
  "*": { symbol: "×", apply: (a, b) => a * b },
  "/": {
    symbol: "÷",
    apply: (a, b) => a / b,
    validate: (_left, right) => (right === 0 ? ERROR_MESSAGES.divisionByZero : null),
  },
  "^": { symbol: "^", apply: (a, b) => a ** b },
};

export const isOperator = (value: string): value is Operator =>
  (OPERATORS as readonly string[]).includes(value);
