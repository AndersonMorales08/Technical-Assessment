import { HttpError, type HttpClient } from "../../../shared/api/httpClient";
import {
  CalculationError,
  ERROR_MESSAGES,
  type CalculationRequest,
  type CalculationService,
  type Operator,
} from "../logic";

/**
 * Contrato esperado por el backend:
 * - POST /calculate/{operation}
 * - Cuerpo con los operandos según el tipo de cálculo.
 */
const OPERATION_NAMES: Record<Operator, string> = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "divide",
  "^": "power",
};

function endpointFor(request: CalculationRequest): string {
  switch (request.kind) {
    case "binary":
      return `/calculator/${OPERATION_NAMES[request.operator]}`;
    case "sqrt":
      return "/calculator/sqrt";
    case "percent":
      return "/calculator/percentage";
  }
}

function toBody(request: CalculationRequest) {
  switch (request.kind) {
    case "binary":
      return { a: request.left, b: request.right };
    case "sqrt":
      return { a: request.value };
    case "percent":
      return { a: request.base, b: request.value };
  }
}

/** Valida la respuesta en lugar de fiarse de ella. */
function parseResult(payload: unknown): number {
  if (typeof payload === "object" && payload !== null && "result" in payload) {
    const { result } = payload;
    if (typeof result === "number" && Number.isFinite(result)) return result;
  }
  throw new CalculationError(ERROR_MESSAGES.invalidResponse);
}

/** Traduce los fallos técnicos a mensajes para el usuario. */
function toCalculationError(error: unknown): unknown {
  if (error instanceof CalculationError) return error;

  if (error instanceof HttpError) {
    const message = error.status >= 500 ? ERROR_MESSAGES.serverUnavailable : ERROR_MESSAGES.serverRejected;
    return new CalculationError(message);
  }
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new CalculationError(ERROR_MESSAGES.timeout);
  }
  if (error instanceof TypeError) {
    // fetch lanza TypeError cuando no hay red, falla el DNS o CORS bloquea la petición.
    return new CalculationError(ERROR_MESSAGES.unreachable);
  }
  return error; // p. ej. AbortError: se deja pasar tal cual
}

export function createHttpCalculationService(client: HttpClient): CalculationService {
  return {
    async calculate(request, signal) {
      try {
        const payload = await client.post(endpointFor(request), toBody(request), signal);
        return parseResult(payload);
      } catch (error) {
        throw toCalculationError(error);
      }
    },
  };
}
