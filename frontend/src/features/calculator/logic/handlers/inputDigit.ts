import { MAX_DIGITS, NEGATIVE_ZERO, ZERO } from "../constants";
import { startNewNumber } from "../helpers";
import type { CalculatorState } from "../types";

const countDigits = (raw: string): number => raw.replace(/[-.]/g, "").length;

function appendDigit(current: string, digit: string): string {
  if (current === ZERO) return digit; // evita "07"
  if (current === NEGATIVE_ZERO) return `-${digit}`;
  return current + digit;
}

export function inputDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.overwrite) return startNewNumber(state, digit);
  if (countDigits(state.current) >= MAX_DIGITS) return state;

  return { ...state, current: appendDigit(state.current, digit) };
}
