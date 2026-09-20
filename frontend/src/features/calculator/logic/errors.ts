/** Error de cálculo cuyo mensaje se puede mostrar tal cual al usuario. */
export class CalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculationError";
  }
}
