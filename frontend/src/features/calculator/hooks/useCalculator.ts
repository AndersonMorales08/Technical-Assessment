import { useReducer } from "react";
import {
  calculatorReducer,
  formatNumber,
  initialState,
  type Operator,
} from "../logic";

/** Conecta la lógica pura con React y expone los valores ya listos para pintar. */
export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  const displayValue = state.error ?? formatNumber(state.current);
  const pendingOperator: Operator | null = state.awaiting ? state.operator : null;

  return {
    displayValue,
    expression: state.expression,
    hasError: state.error !== null,
    pendingOperator,
    dispatch,
  };
}
