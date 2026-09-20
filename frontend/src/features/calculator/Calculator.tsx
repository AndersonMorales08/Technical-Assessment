import "./styles/tokens.css";
import styles from "./Calculator.module.css";
import { Display } from "./components/Display/Display";
import { Keypad } from "./components/Keypad/Keypad";
import { useCalculator } from "./hooks/useCalculator";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import type { CalculationService } from "./logic";

interface CalculatorProps {
  /** Quien resuelve las operaciones (endpoint externo, un servicio falso en tests…). */
  service: CalculationService;
}

export function Calculator({ service }: CalculatorProps) {
  const { displayValue, expression, hasError, isLoading, pendingOperator, dispatch } =
    useCalculator(service);
  useKeyboardShortcuts(dispatch);

  return (
    <section className={styles.calculator} aria-label="Calculadora">
      <Display
        value={displayValue}
        expression={expression}
        hasError={hasError}
        isLoading={isLoading}
      />
      <Keypad pendingOperator={pendingOperator} onAction={dispatch} />
    </section>
  );
}
