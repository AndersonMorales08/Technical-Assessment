import { BackspaceIcon } from "../components/icons/BackspaceIcon";
import type { KeyDefinition } from "../components/Key/Key.types";
import { OPERATIONS, type Operator } from "../logic";

const digitKey = (digit: string): KeyDefinition => ({
  id: `digit-${digit}`,
  label: digit,
  action: { type: "digit", digit },
  variant: "number",
});

const operatorKey = (operator: Operator, ariaLabel: string): KeyDefinition => ({
  id: `operator-${operator}`,
  label: OPERATIONS[operator].symbol,
  ariaLabel,
  action: { type: "operator", operator },
  variant: "operator",
});

/** Orden visual de las teclas: la cuadrícula tiene 4 columnas. */
export const KEYPAD_LAYOUT: readonly KeyDefinition[] = [
  { id: "clear", label: "AC", ariaLabel: "Borrar todo", action: { type: "clear" }, variant: "function" },
  { id: "backspace", label: <BackspaceIcon />, ariaLabel: "Borrar último dígito", action: { type: "backspace" }, variant: "function" },
  { id: "sqrt", label: "√", ariaLabel: "Raíz cuadrada", action: { type: "sqrt" }, variant: "function" },
  { id: "power", label: <>x<sup>y</sup></>, ariaLabel: "Elevar a una potencia", action: { type: "operator", operator: "^" }, variant: "function" },

  digitKey("7"), digitKey("8"), digitKey("9"), operatorKey("/", "Dividir"),
  digitKey("4"), digitKey("5"), digitKey("6"), operatorKey("*", "Multiplicar"),
  digitKey("1"), digitKey("2"), digitKey("3"), operatorKey("-", "Restar"),

  { id: "percent", label: "%", ariaLabel: "Porcentaje", action: { type: "percent" }, variant: "function" },
  digitKey("0"),
  { id: "decimal", label: ",", ariaLabel: "Coma decimal", action: { type: "decimal" }, variant: "number" },
  operatorKey("+", "Sumar"),

  { id: "equals", label: "=", ariaLabel: "Calcular resultado", action: { type: "equals" }, variant: "equals", fullWidth: true },
];
