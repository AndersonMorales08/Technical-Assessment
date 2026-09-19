import { describe, expect, it } from "vitest";
import { keyToAction } from "./config/keyboardShortcuts";
import {
  calculatorReducer,
  formatNumber,
  initialState,
  type CalculatorState,
} from "./logic";

/** Atajos solo para los tests: "<" = Retroceso, "C" = Escape. */
const ALIASES: Readonly<Record<string, string | undefined>> = { "<": "Backspace", C: "Escape" };

function press(sequence: string): CalculatorState {
  return [...sequence].reduce((state, char) => {
    const action = keyToAction(ALIASES[char] ?? char);
    if (!action) throw new Error(`Tecla no soportada en el test: "${char}"`);
    return calculatorReducer(state, action);
  }, initialState);
}

const screen = (sequence: string): string => {
  const { error, current } = press(sequence);
  return error ?? formatNumber(current);
};

describe("operaciones", () => {
  it.each([
    ["suma", "2+3=", "5"],
    ["resta", "9-12=", "-3"],
    ["multiplicación", "6*7=", "42"],
    ["división", "7/2=", "3,5"],
    ["potencia", "2^10=", "1.024"],
    ["potencia fraccionaria", "2^0.5=", "1,41421356237"],
    ["raíz cuadrada", "81r", "9"],
    ["raíz de un resultado", "4-r", "2"],
    ["porcentaje solo", "50%", "0,5"],
    ["porcentaje en suma", "200+10%=", "220"],
    ["porcentaje en multiplicación", "200*10%=", "20"],
  ])("%s (%s) → %s", (_name, keys, expected) => {
    expect(screen(keys)).toBe(expected);
  });
});

describe("comportamiento de calculadora", () => {
  it.each([
    ["evita errores de coma flotante", "0.1+0.2=", "0,3"],
    ["encadena de izquierda a derecha", "2+3*4=", "20"],
    ["muestra el parcial al encadenar", "2+3-", "5"],
    ["reemplaza el operador repetido", "2+*3=", "6"],
    ["'5 + =' repite el operando", "5+=", "10"],
    ["continúa con el resultado", "7=+1=", "8"],
    ["empieza un número nuevo tras '='", "3+4=5", "5"],
    ["ignora una segunda coma", "1.5.5", "1,55"],
    ["agrupa miles", "1234567=", "1.234.567"],
    ["retroceso hasta cero", "12<<", "0"],
  ])("%s (%s) → %s", (_name, keys, expected) => {
    expect(screen(keys)).toBe(expected);
  });
});

describe("números negativos", () => {
  it.each([
    ["al inicio", "-5+3=", "-2"],
    ["tras una potencia", "2^-1=", "0,5"],
    ["tras una multiplicación", "6*-2=", "-12"],
    ["tras una división", "8/-2=", "-4"],
    ["y sigue encadenando", "6*-2+1=", "-11"],
  ])("%s (%s) → %s", (_name, keys, expected) => {
    expect(screen(keys)).toBe(expected);
  });
});

describe("errores", () => {
  it("no permite dividir entre cero", () => {
    expect(screen("5/0=")).toBe("No se puede dividir entre cero");
  });

  it("no permite la raíz de un negativo", () => {
    expect(screen("-5r")).toBe("No existe la raíz de un número negativo");
  });

  it("solo se recupera escribiendo un número o con AC", () => {
    expect(screen("5/0=+")).toBe("No se puede dividir entre cero");
    expect(screen("5/0=7")).toBe("7");
    expect(screen("5/0=C7")).toBe("7");
  });
});

describe("formato", () => {
  it("usa notación científica para números enormes o diminutos", () => {
    expect(screen("1000000*1000000*1000000=")).toBe("1e18");
    expect(screen("0.0000001*1=")).toBe("1e-7");
  });
});

describe("atajos de teclado", () => {
  it("ignora teclas sin función", () => {
    expect(keyToAction("Shift")).toBeNull();
    expect(keyToAction("q")).toBeNull();
  });

  it("acepta P como potencia (la tecla ^ es muerta en teclados en español)", () => {
    expect(keyToAction("p")).toEqual({ type: "operator", operator: "^" });
  });
});
