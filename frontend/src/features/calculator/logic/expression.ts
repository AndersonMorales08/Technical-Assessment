import { formatOperand } from "./format";
import { OPERATIONS, type Operator } from "./operators";

const symbolOf = (operator: Operator): string => OPERATIONS[operator].symbol;

/** "12 +" */
export const pendingExpression = (left: number, operator: Operator): string =>
  `${formatOperand(left)} ${symbolOf(operator)}`;

/** "12 + 3 =" */
export const completedExpression = (left: number, operator: Operator, right: number): string =>
  `${formatOperand(left)} ${symbolOf(operator)} ${formatOperand(right)} =`;

/** "√(9)" */
export const sqrtExpression = (value: number): string => `√(${formatOperand(value)})`;
