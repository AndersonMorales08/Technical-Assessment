import { ERROR_MESSAGES } from "./constants";
import { OPERATIONS } from "./operators";
import type { PendingCalculation } from "./types";

/** Reglas de entrada que evitan una petición inútil. Devuelve el mensaje de error o null. */
export function validate(pending: PendingCalculation): string | null {
  switch (pending.kind) {
    case "evaluate":
    case "chain":
      return OPERATIONS[pending.operator].validate?.(pending.left, pending.right) ?? null;
    case "sqrt":
      return pending.value < 0 ? ERROR_MESSAGES.negativeRoot : null;
    case "percent":
      return null;
  }
}
