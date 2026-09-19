import type { ReactNode } from "react";
import type { CalculatorAction } from "../../logic";

export type KeyVariant = "number" | "function" | "operator" | "equals";

export interface KeyDefinition {
  /** Identificador estable (se usa como `key` de React). */
  id: string;
  label: ReactNode;
  /** Etiqueta para lectores de pantalla; si falta se usa el texto visible. */
  ariaLabel?: string;
  action: CalculatorAction;
  variant: KeyVariant;
  fullWidth?: boolean;
}
