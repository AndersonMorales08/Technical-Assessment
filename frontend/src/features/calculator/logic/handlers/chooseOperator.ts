import { NEGATIVE_ZERO, ZERO } from "../constants";
import { pendingExpression } from "../expression";
import { toRaw } from "../format";
import { failWith } from "../helpers";
import { calculate } from "../math";
import type { Operator } from "../operators";
import type { CalculationResult, CalculatorState } from "../types";

/** Tras estos operadores, "−" es el signo del segundo número (2 ^ −1). */
const OPERATORS_ACCEPTING_SIGN: readonly Operator[] = ["*", "/", "^"];

/** Pantalla recién iniciada: nada escrito y nada pendiente. */
const isPristine = (state: CalculatorState): boolean =>
  state.current === ZERO &&
  state.operator === null &&
  state.expression === "" &&
  !state.overwrite;

const expectsSignedOperand = (state: CalculatorState, operator: Operator): boolean =>
  operator === "-" &&
  state.awaiting &&
  state.operator !== null &&
  OPERATORS_ACCEPTING_SIGN.includes(state.operator);

/** Resuelve la operación pendiente (si la hay) para poder encadenar la siguiente. */
function resolveLeftOperand(state: CalculatorState): CalculationResult {
  const typed = Number(state.current);
  if (state.operator === null || state.previous === null) return { value: typed };

  return calculate(state.previous, state.operator, typed);
}

function replaceOperator(state: CalculatorState, operator: Operator): CalculatorState {
  const left = state.previous ?? Number(state.current);
  return { ...state, operator, expression: pendingExpression(left, operator) };
}

function chainOperation(state: CalculatorState, operator: Operator): CalculatorState {
  const left = resolveLeftOperand(state);
  if ("error" in left) return failWith(left.error);

  return {
    ...state,
    current: toRaw(left.value),
    previous: left.value,
    operator,
    awaiting: true,
    overwrite: true,
    expression: pendingExpression(left.value, operator),
  };
}

export function chooseOperator(state: CalculatorState, operator: Operator): CalculatorState {
  // "−" al inicio: empieza un número negativo.
  if (operator === "-" && isPristine(state)) {
    return { ...state, current: NEGATIVE_ZERO };
  }
  // "−" después de ×, ÷ o ^: signo del segundo operando.
  if (expectsSignedOperand(state, operator)) {
    return { ...state, current: NEGATIVE_ZERO, awaiting: false, overwrite: false };
  }
  // Operador elegido dos veces seguidas: se reemplaza el anterior.
  if (state.awaiting) return replaceOperator(state, operator);

  return chainOperation(state, operator);
}
