import { ERROR_MESSAGES } from "./constants";

export const OPERATORS = ["+", "-", "*", "/", "^"] as const;
export type Operator = (typeof OPERATORS)[number];

interface OperationDefinition {
  /** Símbolo que se muestra en pantalla. */
  symbol: string;
  /** Regla de entrada; devuelve un mensaje de error si los operandos no son válidos. */
  validate?: (left: number, right: number) => string | null;
}

/**
 * Datos de cada operación binaria. El cálculo en sí lo hace el servidor;
 * cómo se llama cada una en la petición se define en api/httpCalculationService.ts.
 */
export const OPERATIONS: Record<Operator, OperationDefinition> = {
  "+": { symbol: "+" },
  "-": { symbol: "−" },
  "*": { symbol: "×" },
  "/": {
    symbol: "÷",
    validate: (_left, right) => (right === 0 ? ERROR_MESSAGES.divisionByZero : null),
  },
  "^": { symbol: "^" },
};

export const isOperator = (value: string): value is Operator =>
  (OPERATORS as readonly string[]).includes(value);
