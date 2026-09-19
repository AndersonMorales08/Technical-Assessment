import { ZERO } from "./constants";
import type { CalculatorState } from "./types";

export const initialState: CalculatorState = {
  current: ZERO,
  previous: null,
  operator: null,
  awaiting: false,
  overwrite: false,
  expression: "",
  error: null,
};
