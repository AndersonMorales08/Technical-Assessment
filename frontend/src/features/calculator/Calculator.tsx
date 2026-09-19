import "./styles/tokens.css";
import styles from "./Calculator.module.css";
import { Display } from "./components/Display/Display";
import { Keypad } from "./components/Keypad/Keypad";
import { useCalculator } from "./hooks/useCalculator";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

export function Calculator() {
  const { displayValue, expression, hasError, pendingOperator, dispatch } = useCalculator();
  useKeyboardShortcuts(dispatch);

  return (
    <section className={styles.calculator} aria-label="Calculadora">
      <Display value={displayValue} expression={expression} hasError={hasError} />
      <Keypad pendingOperator={pendingOperator} onAction={dispatch} />
    </section>
  );
}
