/** Máximo de dígitos que se pueden teclear en un número. */
export const MAX_DIGITS = 12;

export const ZERO = "0";
export const NEGATIVE_ZERO = "-0";

export const ERROR_MESSAGES = {
  // Reglas de entrada: se comprueban antes de llamar al servidor.
  divisionByZero: "No se puede dividir entre cero",
  negativeRoot: "No existe la raíz de un número negativo",
  // Fallos al comunicarse con el servidor.
  unreachable: "No se pudo conectar con el servidor",
  timeout: "El servidor tardó demasiado en responder",
  serverUnavailable: "El servidor no está disponible en este momento",
  serverRejected: "El servidor no pudo realizar la operación",
  invalidResponse: "El servidor devolvió una respuesta no válida",
  unexpected: "Ocurrió un error inesperado",
} as const;
