import { completedExpression, sqrtExpression } from "../expression";
import { toRaw } from "../format";
import { startOperation } from "../helpers";
import type { CalculatorState } from "../types";

/** Incorpora la respuesta del servidor al estado, según lo que se había pedido. */
export function applyResult(state: CalculatorState, value: number): CalculatorState {
  const { pending } = state;
  if (pending === null) return state; // respuesta tardía (p. ej. el usuario pulsó AC)

  const settled: CalculatorState = { ...state, pending: null };

  switch (pending.kind) {
    case "evaluate":
      return {
        ...settled,
        current: toRaw(value),
        previous: null,
        operator: null,
        awaiting: false,
        overwrite: true,
        expression: completedExpression(pending.left, pending.operator, pending.right),
      };

    case "chain":
      return startOperation(settled, value, pending.next);

    case "sqrt":
      return {
        ...settled,
        current: toRaw(value),
        awaiting: false,
        overwrite: true,
        // Con una operación pendiente se conserva su expresión.
        expression: settled.operator ? settled.expression : sqrtExpression(pending.value),
      };

    case "percent":
      return { ...settled, current: toRaw(value), awaiting: false, overwrite: true };
  }
}
