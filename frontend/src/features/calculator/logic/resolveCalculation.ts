import { ERROR_MESSAGES } from "./constants";
import { CalculationError } from "./errors";
import type {
  CalculationRequest,
  CalculationService,
  CalculatorAction,
  PendingCalculation,
} from "./types";

function toRequest(pending: PendingCalculation): CalculationRequest {
  switch (pending.kind) {
    case "evaluate":
    case "chain":
      return { kind: "binary", operator: pending.operator, left: pending.left, right: pending.right };
    case "sqrt":
      return { kind: "sqrt", value: pending.value };
    case "percent":
      return { kind: "percent", value: pending.value, base: pending.base };
  }
}

/**
 * Ejecuta el cálculo pendiente contra el servicio y devuelve la acción que
 * el reducer debe recibir. Devuelve null si la petición fue cancelada.
 * No depende de React, así que se puede probar con un servicio falso.
 */
export async function resolveCalculation(
  pending: PendingCalculation,
  service: CalculationService,
  signal: AbortSignal,
): Promise<CalculatorAction | null> {
  try {
    const value = await service.calculate(toRequest(pending), signal);
    return signal.aborted ? null : { type: "calculationSucceeded", value };
  } catch (error) {
    if (signal.aborted) return null;

    const message = error instanceof CalculationError ? error.message : ERROR_MESSAGES.unexpected;
    return { type: "calculationFailed", message };
  }
}
