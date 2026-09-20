import { describe, expect, it } from "vitest";
import { keyToAction } from "./config/keyboardShortcuts";
import {
  CalculationError,
  ERROR_MESSAGES,
  calculatorReducer,
  formatNumber,
  initialState,
  resolveCalculation,
  type CalculationService,
  type CalculatorState,
} from "./logic";

/** Servicio falso: hace las cuentas en local, como lo haría el endpoint. */
const localService: CalculationService = {
  async calculate(request) {
    switch (request.kind) {
      case "binary": {
        const { left, right, operator } = request;
        if (operator === "+") return left + right;
        if (operator === "-") return left - right;
        if (operator === "*") return left * right;
        if (operator === "/") return left / right;
        return left ** right;
      }
      case "sqrt":
        return Math.sqrt(request.value);
      case "percent":
        return request.base === null ? request.value / 100 : (request.base * request.value) / 100;
    }
  },
};

/** Atajos solo para los tests: "<" = Retroceso, "C" = Escape. */
const ALIASES: Readonly<Record<string, string | undefined>> = { "<": "Backspace", C: "Escape" };

function pressKey(state: CalculatorState, char: string): CalculatorState {
  const action = keyToAction(ALIASES[char] ?? char);
  if (!action) throw new Error(`Tecla no soportada en el test: "${char}"`);
  return calculatorReducer(state, action);
}

/** Aplica las teclas SIN esperar al servidor (deja `pending` a la vista). */
const pressWithoutSettling = (sequence: string, from = initialState): CalculatorState =>
  [...sequence].reduce(pressKey, from);

/** Resuelve el cálculo pendiente con el servicio, igual que hace el hook. */
async function settle(
  state: CalculatorState,
  service: CalculationService = localService,
): Promise<CalculatorState> {
  if (!state.pending) return state;
  const action = await resolveCalculation(state.pending, service, new AbortController().signal);
  return action ? calculatorReducer(state, action) : state;
}

async function press(sequence: string, service?: CalculationService): Promise<CalculatorState> {
  let state = initialState;
  for (const char of sequence) state = await settle(pressKey(state, char), service);
  return state;
}

async function screen(sequence: string, service?: CalculationService): Promise<string> {
  const { error, current } = await press(sequence, service);
  return error ?? formatNumber(current);
}

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
  ])("%s (%s) → %s", async (_name, keys, expected) => {
    expect(await screen(keys)).toBe(expected);
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
  ])("%s (%s) → %s", async (_name, keys, expected) => {
    expect(await screen(keys)).toBe(expected);
  });
});

describe("números negativos", () => {
  it.each([
    ["al inicio", "-5+3=", "-2"],
    ["tras una potencia", "2^-1=", "0,5"],
    ["tras una multiplicación", "6*-2=", "-12"],
    ["tras una división", "8/-2=", "-4"],
    ["y sigue encadenando", "6*-2+1=", "-11"],
  ])("%s (%s) → %s", async (_name, keys, expected) => {
    expect(await screen(keys)).toBe(expected);
  });
});

describe("reglas de entrada (no llegan al servidor)", () => {
  it("no permite dividir entre cero", () => {
    const state = pressWithoutSettling("5/0=");
    expect(state.error).toBe(ERROR_MESSAGES.divisionByZero);
    expect(state.pending).toBeNull();
  });

  it("no permite la raíz de un negativo", () => {
    const state = pressWithoutSettling("-5r");
    expect(state.error).toBe(ERROR_MESSAGES.negativeRoot);
    expect(state.pending).toBeNull();
  });

  it("solo se recupera escribiendo un número o con AC", async () => {
    expect(await screen("5/0=+")).toBe(ERROR_MESSAGES.divisionByZero);
    expect(await screen("5/0=7")).toBe("7");
    expect(await screen("5/0=C7")).toBe("7");
  });
});

describe("comunicación con el servidor", () => {
  it("pide el cálculo al pulsar '=' y queda a la espera", () => {
    const state = pressWithoutSettling("2+3=");
    expect(state.pending).toEqual({ kind: "evaluate", operator: "+", left: 2, right: 3 });
  });

  it("al encadenar pide primero la operación pendiente", () => {
    const state = pressWithoutSettling("2+3*");
    expect(state.pending).toMatchObject({ kind: "chain", operator: "+", left: 2, right: 3, next: "*" });
  });

  it("envía la base del porcentaje solo tras + o −", () => {
    expect(pressWithoutSettling("200+10%").pending).toEqual({ kind: "percent", value: 10, base: 200 });
    expect(pressWithoutSettling("200*10%").pending).toEqual({ kind: "percent", value: 10, base: null });
  });

  it("ignora teclas mientras espera la respuesta", () => {
    const waiting = pressWithoutSettling("2+3=");
    expect(pressWithoutSettling("9+", waiting)).toBe(waiting);
  });

  it("AC cancela el cálculo y descarta la respuesta tardía", () => {
    const waiting = pressWithoutSettling("2+3=");
    const cleared = calculatorReducer(waiting, { type: "clear" });
    const late = calculatorReducer(cleared, { type: "calculationSucceeded", value: 5 });

    expect(cleared).toEqual(initialState);
    expect(late).toEqual(initialState);
  });

  it("muestra el mensaje cuando el servicio falla con un CalculationError", async () => {
    const failing: CalculationService = {
      calculate: () => Promise.reject(new CalculationError(ERROR_MESSAGES.unreachable)),
    };
    expect(await screen("2+3=", failing)).toBe(ERROR_MESSAGES.unreachable);
  });

  it("usa un mensaje genérico ante errores desconocidos", async () => {
    const broken: CalculationService = { calculate: () => Promise.reject(new Error("boom")) };
    expect(await screen("2+3=", broken)).toBe(ERROR_MESSAGES.unexpected);
  });

  it("no devuelve acción si la petición fue cancelada", async () => {
    const controller = new AbortController();
    const slow: CalculationService = {
      calculate: (_request, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () => reject(new DOMException("cancelado", "AbortError")));
        }),
    };
    const pending = pressWithoutSettling("2+3=").pending;
    if (!pending) throw new Error("se esperaba un cálculo pendiente");

    const result = resolveCalculation(pending, slow, controller.signal);
    controller.abort();

    expect(await result).toBeNull();
  });
});

describe("formato", () => {
  it("usa notación científica para números enormes o diminutos", async () => {
    expect(await screen("1000000*1000000*1000000=")).toBe("1e18");
    expect(await screen("0.0000001*1=")).toBe("1e-7");
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
