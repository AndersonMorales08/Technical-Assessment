import { classNames } from "../../../../shared/utils/classNames";
import type { CalculatorAction } from "../../logic";
import styles from "./Key.module.css";
import type { KeyDefinition, KeyVariant } from "./Key.types";

const VARIANT_CLASS: Record<KeyVariant, string> = {
  number: styles.number,
  function: styles.function,
  operator: styles.operator,
  equals: styles.equals,
};

interface KeyProps {
  definition: KeyDefinition;
  /** Operador elegido a la espera del segundo número. */
  isPending: boolean;
  onPress: (action: CalculatorAction) => void;
}

export function Key({ definition, isPending, onPress }: KeyProps) {
  const { label, ariaLabel, action, variant, fullWidth } = definition;
  const isOperator = action.type === "operator";

  return (
    <button
      type="button"
      className={classNames(
        styles.key,
        VARIANT_CLASS[variant],
        fullWidth && styles.fullWidth,
        isPending && styles.pending,
      )}
      aria-label={ariaLabel}
      aria-pressed={isOperator ? isPending : undefined}
      onClick={() => onPress(action)}
    >
      {label}
    </button>
  );
}
