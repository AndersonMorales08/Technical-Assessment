import { useEffect, type Dispatch } from "react";
import { keyToAction } from "../config/keyboardShortcuts";
import type { CalculatorAction } from "../logic";

export function useKeyboardShortcuts(dispatch: Dispatch<CalculatorAction>): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const action = keyToAction(event.key);
      if (!action) return;

      event.preventDefault(); // evita que Enter active además el botón enfocado
      dispatch(action);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);
}
