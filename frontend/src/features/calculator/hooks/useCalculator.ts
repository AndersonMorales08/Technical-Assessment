import { useEffect, useReducer } from "react";
import {
  calculatorReducer,
  formatNumber,
  initialState,
  resolveCalculation,
  type CalculationService,
  type Operator,
} from "../logic";

/**
 * Conecta la lógica pura con React. El reducer solo anota qué hay que calcular
 * (`state.pending`); este hook hace la petición y devuelve la respuesta al reducer.
 */
export function useCalculator(service: CalculationService) {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const { pending } = state;

  useEffect(() => {
    if (pending === null) return undefined;

    const controller = new AbortController();
    void resolveCalculation(pending, service, controller.signal).then((action) => {
      if (action) dispatch(action);
    });

    // AC (o desmontar el componente) cancela la petición en curso.
    return () => controller.abort();
  }, [pending, service]);

  const displayValue = state.error ?? formatNumber(state.current);
  const pendingOperator: Operator | null = state.awaiting ? state.operator : null;

  return {
    displayValue,
    expression: state.expression,
    hasError: state.error !== null,
    isLoading: pending !== null,
    pendingOperator,
    dispatch,
  };
}
