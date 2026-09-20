import { classNames } from "../../../../shared/utils/classNames";
import styles from "./Display.module.css";

/** Cuanto más largo el texto, más pequeña la tipografía (de mayor a menor). */
const FONT_STEPS = [
  { longerThan: 16, className: styles.extraSmall },
  { longerThan: 11, className: styles.small },
  { longerThan: 8, className: styles.medium },
] as const;

const getSizeClass = (value: string, hasError: boolean): string | undefined => {
  if (hasError) return styles.error;
  return FONT_STEPS.find(({ longerThan }) => value.length > longerThan)?.className;
};

interface DisplayProps {
  value: string;
  expression: string;
  hasError: boolean;
  /** Esperando la respuesta del servidor. */
  isLoading: boolean;
}

export function Display({ value, expression, hasError, isLoading }: DisplayProps) {
  return (
    <div
      className={styles.display}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy={isLoading}
    >
      {/* El espacio no separable mantiene la altura cuando no hay expresión. */}
      <span className={styles.expression}>{expression || "\u00A0"}</span>
      <span
        className={classNames(
          styles.value,
          getSizeClass(value, hasError),
          isLoading && styles.loading,
        )}
      >
        {value}
      </span>
    </div>
  );
}
