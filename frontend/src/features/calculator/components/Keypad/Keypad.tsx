import { KEYPAD_LAYOUT } from "../../config/keypadLayout";
import type { CalculatorAction, Operator } from "../../logic";
import { Key } from "../Key/Key";
import type { KeyDefinition } from "../Key/Key.types";
import styles from "./Keypad.module.css";

interface KeypadProps {
  pendingOperator: Operator | null;
  onAction: (action: CalculatorAction) => void;
  keys?: readonly KeyDefinition[];
}

const isPending = (key: KeyDefinition, pendingOperator: Operator | null): boolean =>
  key.action.type === "operator" && key.action.operator === pendingOperator;

export function Keypad({ pendingOperator, onAction, keys = KEYPAD_LAYOUT }: KeypadProps) {
  return (
    <div className={styles.keypad}>
      {keys.map((key) => (
        <Key
          key={key.id}
          definition={key}
          isPending={isPending(key, pendingOperator)}
          onPress={onAction}
        />
      ))}
    </div>
  );
}
